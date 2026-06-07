from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Campus
from app.schemas import CampusResponse

router = APIRouter(
    prefix="/api/campuses",
    tags=["Campuses"]
)


@router.get("/", response_model=list[CampusResponse])
def get_campuses(db: Session = Depends(get_db)):
    return db.query(Campus).all()