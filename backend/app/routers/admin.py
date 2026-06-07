import csv
import io
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session, joinedload

load_dotenv()

from app.database import get_db, SessionLocal
from app.models import Campus, Restaurant, Review, AnalysisJob, RestaurantSummary
from app.schemas import (
    AdminLoginRequest,
    AdminTokenResponse,
    AdminRestaurantCreate,
    AdminRestaurantUpdate,
    AnalysisJobCreate,
)
from app.routers.restaurant import restaurant_to_frontend_item


router = APIRouter(prefix="/api/admin", tags=["Admin"])

security = HTTPBearer()

JWT_SECRET = os.getenv("ADMIN_JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 3600

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "password123")


def create_access_token(username: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": username,
        "role": "admin",
        "iat": now,
        "exp": now + timedelta(seconds=ACCESS_TOKEN_EXPIRE_SECONDS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def require_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if payload.get("sub") != ADMIN_USERNAME:
        raise HTTPException(status_code=401, detail="Invalid token")

    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin permission required")

    return payload

def to_iso_z(dt):
    if not dt:
        return None
    return dt.isoformat() + "Z"

def analysis_job_to_response(job: AnalysisJob):
    return {
        "jobId": job.job_id,
        "restaurantId": job.restaurant_id,
        "restaurantName": job.restaurant.name if job.restaurant else None,
        "status": job.status,
        "progress": job.progress,
        "createdAt": to_iso_z(job.created_at),
        "completedAt": to_iso_z(job.completed_at),
    }


@router.post("/auth/login", response_model=AdminTokenResponse)
def admin_login(payload: AdminLoginRequest):
    username_ok = secrets.compare_digest(payload.username, ADMIN_USERNAME)
    password_ok = secrets.compare_digest(payload.password, ADMIN_PASSWORD)

    if not (username_ok and password_ok):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(payload.username)

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_SECONDS,
    }


@router.get("/restaurants")
def admin_get_restaurants(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    restaurants = (
        db.query(Restaurant)
        .options(joinedload(Restaurant.summary), joinedload(Restaurant.tags))
        .filter(Restaurant.is_active == True)
        .all()
    )

    return [restaurant_to_frontend_item(r) for r in restaurants]


@router.post("/restaurants", status_code=status.HTTP_201_CREATED)
def admin_create_restaurant(
    payload: AdminRestaurantCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    campus = db.query(Campus).filter(Campus.slug == payload.campusSlug).first()
    if not campus:
        raise HTTPException(status_code=404, detail="Campus not found")

    external_id = payload.externalId or f"admin_{uuid.uuid4().hex[:12]}"

    existing = (
        db.query(Restaurant)
        .filter(Restaurant.external_id == external_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="externalId already exists")

    restaurant = Restaurant(
        external_id=external_id,
        campus_id=campus.id,
        name=payload.name,
        address=payload.address,
        latitude=payload.lat,
        longitude=payload.lng,
        category=payload.category,
        price_level=payload.priceLevel,
        phone=payload.phone,
        source_url=payload.sourceUrl,
        is_active=True,
    )

    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)

    restaurant = (
        db.query(Restaurant)
        .options(joinedload(Restaurant.summary), joinedload(Restaurant.tags))
        .filter(Restaurant.id == restaurant.id)
        .first()
    )

    return restaurant_to_frontend_item(restaurant)


@router.put("/restaurants/{restaurant_id}")
def admin_update_restaurant(
    restaurant_id: int,
    payload: AdminRestaurantUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == restaurant_id)
        .filter(Restaurant.is_active == True)
        .first()
    )

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    update_data = payload.model_dump(exclude_unset=True)

    if "campusSlug" in update_data:
        campus = db.query(Campus).filter(Campus.slug == update_data["campusSlug"]).first()
        if not campus:
            raise HTTPException(status_code=404, detail="Campus not found")
        restaurant.campus_id = campus.id

    if "name" in update_data:
        restaurant.name = update_data["name"]
    if "address" in update_data:
        restaurant.address = update_data["address"]
    if "category" in update_data:
        restaurant.category = update_data["category"]
    if "priceLevel" in update_data:
        restaurant.price_level = update_data["priceLevel"]
    if "lat" in update_data:
        restaurant.latitude = update_data["lat"]
    if "lng" in update_data:
        restaurant.longitude = update_data["lng"]
    if "phone" in update_data:
        restaurant.phone = update_data["phone"]
    if "sourceUrl" in update_data:
        restaurant.source_url = update_data["sourceUrl"]
    if "externalId" in update_data:
        new_external_id = update_data["externalId"]

        if new_external_id != restaurant.external_id:
            existing = (
                db.query(Restaurant)
                .filter(Restaurant.external_id == new_external_id)
                .filter(Restaurant.id != restaurant.id)
                .first()
            )

            if existing:
                raise HTTPException(status_code=409, detail="externalId already exists")

            restaurant.external_id = new_external_id

    db.commit()
    db.refresh(restaurant)

    restaurant = (
        db.query(Restaurant)
        .options(joinedload(Restaurant.summary), joinedload(Restaurant.tags))
        .filter(Restaurant.id == restaurant.id)
        .first()
    )

    return restaurant_to_frontend_item(restaurant)


@router.delete("/restaurants/{restaurant_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == restaurant_id)
        .filter(Restaurant.is_active == True)
        .first()
    )

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    restaurant.is_active = False
    db.commit()

    return None


@router.post("/reviews/upload")
async def admin_upload_reviews(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV file is required")

    raw = await file.read()

    try:
        text = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="CSV must be UTF-8 encoded")

    reader = csv.DictReader(io.StringIO(text))

    required_columns = {"restaurant_external_id", "content", "source_url"}
    if not reader.fieldnames or not required_columns.issubset(set(reader.fieldnames)):
        raise HTTPException(
            status_code=400,
            detail="CSV columns must include restaurant_external_id, content, source_url",
        )

    inserted_count = 0
    skipped_count = 0
    error_count = 0
    errors = []

    for row_number, row in enumerate(reader, start=2):
        restaurant_external_id = (row.get("restaurant_external_id") or "").strip()
        content = (row.get("content") or "").strip()
        source_url = (row.get("source_url") or "").strip()

        if not restaurant_external_id or not content:
            error_count += 1
            errors.append(f"행 {row_number}: restaurant_external_id 또는 content 누락")
            continue

        restaurant = (
            db.query(Restaurant)
            .filter(Restaurant.external_id == restaurant_external_id)
            .filter(Restaurant.is_active == True)
            .first()
        )

        if not restaurant:
            error_count += 1
            errors.append(f"행 {row_number}: restaurant_external_id '{restaurant_external_id}' 없음")
            continue

        duplicate = (
            db.query(Review)
            .filter(Review.restaurant_id == restaurant.id)
            .filter(Review.content == content)
            .first()
        )

        if duplicate:
            skipped_count += 1
            continue

        review = Review(
            restaurant_id=restaurant.id,
            content=content,
            source_url=source_url,
        )
        db.add(review)
        inserted_count += 1

    db.commit()

    return {
        "insertedCount": inserted_count,
        "skippedCount": skipped_count,
        "errorCount": error_count,
        "errors": errors,
    }


@router.get("/analysis-jobs")
def admin_get_analysis_jobs(
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    jobs = (
        db.query(AnalysisJob)
        .options(joinedload(AnalysisJob.restaurant))
        .order_by(AnalysisJob.created_at.desc())
        .all()
    )

    return [analysis_job_to_response(job) for job in jobs]


def complete_analysis_job(job_id: str):
    db = SessionLocal()

    try:
        job = (
            db.query(AnalysisJob)
            .options(joinedload(AnalysisJob.restaurant))
            .filter(AnalysisJob.job_id == job_id)
            .first()
        )

        if not job:
            return

        job.status = "running"
        job.progress = 50
        db.commit()

        restaurant = job.restaurant

        summary = (
            db.query(RestaurantSummary)
            .filter(RestaurantSummary.restaurant_id == restaurant.id)
            .first()
        )

        if not summary:
            summary = RestaurantSummary(
                restaurant_id=restaurant.id,
                summary_text="관리자 요청으로 분석이 완료된 식당입니다.",
                representative_menu=None,
                mood_summary=None,
                parking_summary=None,
                waiting_summary=None,
                average_trust_score=0,
            )
            db.add(summary)
        else:
            if not summary.summary_text:
                summary.summary_text = "관리자 요청으로 분석이 완료된 식당입니다."

        job.status = "completed"
        job.progress = 100
        job.completed_at = datetime.utcnow()

        db.commit()

    except Exception as e:
        job = db.query(AnalysisJob).filter(AnalysisJob.job_id == job_id).first()
        if job:
            job.status = "failed"
            job.progress = 100
            job.error_message = str(e)
            job.completed_at = datetime.utcnow()
            db.commit()
    finally:
        db.close()


@router.post("/analysis-jobs", status_code=status.HTTP_201_CREATED)
def admin_create_analysis_job(
    payload: AnalysisJobCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    restaurant = (
        db.query(Restaurant)
        .filter(Restaurant.id == payload.restaurantId)
        .filter(Restaurant.is_active == True)
        .first()
    )

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    job = AnalysisJob(
        job_id=f"JOB-{uuid.uuid4().hex[:8].upper()}",
        restaurant_id=restaurant.id,
        status="pending",
        progress=0,
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(complete_analysis_job, job.job_id)

    job = (
        db.query(AnalysisJob)
        .options(joinedload(AnalysisJob.restaurant))
        .filter(AnalysisJob.job_id == job.job_id)
        .first()
    )

    return analysis_job_to_response(job)


@router.get("/analysis-jobs/{job_id}")
def admin_get_analysis_job(
    job_id: str,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin),
):
    job = (
        db.query(AnalysisJob)
        .options(joinedload(AnalysisJob.restaurant))
        .filter(AnalysisJob.job_id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found")

    return analysis_job_to_response(job)