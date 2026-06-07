from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Campus, Restaurant

router = APIRouter(tags=["Restaurants"])


def restaurant_to_frontend_item(
    r: Restaurant,
    recommendation_score: float | None = None,
    reasons: list[str] | None = None,
):
    return {
        "id": r.id,
        "campusId": r.campus_id,
        "name": r.name,
        "category": r.category,
        "lat": r.latitude,
        "lng": r.longitude,
        "address": r.address,
        "priceRange": r.price_level,
        "phone": r.phone,
        "sourceUrl": r.source_url,

        "summary": r.summary.summary_text if r.summary else None,
        "representativeMenu": r.summary.representative_menu if r.summary else None,
        "moodSummary": r.summary.mood_summary if r.summary else None,
        "parkingSummary": r.summary.parking_summary if r.summary else None,
        "waitingSummary": r.summary.waiting_summary if r.summary else None,
        "averageTrustScore": r.summary.average_trust_score if r.summary else None,

        "tags": [
            {
                "type": tag.tag_type,
                "value": tag.tag_value,
                "confidenceScore": tag.confidence_score,
            }
            for tag in r.tags
        ],

        "recommendationScore": recommendation_score,
        "recommendationReasons": reasons or [],
        "hasAnalysis": bool(r.summary),
    }


@router.get("/api/campuses/{campus_slug}/restaurants")
def get_restaurants_by_campus_slug(
    campus_slug: str,
    db: Session = Depends(get_db),
):
    campus = db.query(Campus).filter(Campus.slug == campus_slug).first()

    if not campus:
        raise HTTPException(status_code=404, detail="Campus not found")

    restaurants = (
        db.query(Restaurant)
        .options(
            joinedload(Restaurant.summary),
            joinedload(Restaurant.tags),
        )
        .filter(Restaurant.campus_id == campus.id)
        .filter(Restaurant.is_active == True)
        .all()
    )

    return {
        "campus": {
            "id": campus.id,
            "slug": campus.slug,
            "name": campus.name,
            "lat": campus.latitude,
            "lng": campus.longitude,
            "radiusM": campus.radius_m,
        },
        "restaurants": [restaurant_to_frontend_item(r) for r in restaurants],
    }


@router.get("/api/restaurants/{restaurant_id}")
def get_restaurant_detail(
    restaurant_id: int,
    db: Session = Depends(get_db),
):
    restaurant = (
        db.query(Restaurant)
        .options(
            joinedload(Restaurant.summary),
            joinedload(Restaurant.tags),
        )
        .filter(Restaurant.id == restaurant_id)
        .filter(Restaurant.is_active == True)
        .first()
    )

    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    return restaurant_to_frontend_item(restaurant)


@router.get("/api/campuses/{campus_slug}/recommendations")
def get_recommendations_by_campus_slug(
    campus_slug: str,
    category: str | None = Query(None),
    price_level: str | None = Query(None),
    mood: str | None = Query(None),
    parking: bool | None = Query(None),
    db: Session = Depends(get_db),
):
    campus = db.query(Campus).filter(Campus.slug == campus_slug).first()

    if not campus:
        raise HTTPException(status_code=404, detail="Campus not found")

    query = (
        db.query(Restaurant)
        .options(
            joinedload(Restaurant.summary),
            joinedload(Restaurant.tags),
        )
        .filter(Restaurant.campus_id == campus.id)
        .filter(Restaurant.is_active == True)
    )

    # ── 하드 필터: 조건에 맞지 않는 식당은 제외 ──────────────────────
    if category:
        query = query.filter(Restaurant.category == category)
    if price_level:
        query = query.filter(Restaurant.price_level == price_level)

    restaurants = query.all()

    result = []

    for r in restaurants:
        score = 0
        reasons = []

        tag_values = [tag.tag_value for tag in r.tags]

        if mood and mood in tag_values:
            score += 30
            reasons.append(f"{mood} 분위기 관련 태그가 있는 식당입니다.")
        elif mood:
            # mood 필터인데 태그가 없으면 제외
            continue

        if parking is True:
            if "주차가능" in tag_values or "parking_available" in tag_values:
                score += 20
                reasons.append("주차 가능성이 높은 식당입니다.")
            else:
                # 주차 필터인데 주차 태그 없으면 제외
                continue

        if r.summary and r.summary.average_trust_score:
            score += r.summary.average_trust_score * 0.5
            if r.summary.average_trust_score >= 80:
                reasons.append("신뢰도 높은 리뷰 비율이 높은 편입니다.")

        if not reasons:
            reasons.append("선택한 조건에 맞는 식당입니다.")

        item = restaurant_to_frontend_item(
            r,
            recommendation_score=round(score, 2),
            reasons=reasons,
        )
        result.append(item)

    result.sort(key=lambda x: x["recommendationScore"] or 0, reverse=True)

    return {
        "campus": {
            "id": campus.id,
            "slug": campus.slug,
            "name": campus.name,
        },
        "restaurants": result,
    }