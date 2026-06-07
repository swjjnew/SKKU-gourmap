from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CampusResponse(BaseModel):
    id: int
    slug: str
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_m: Optional[int] = None

    class Config:
        from_attributes = True


class RestaurantListResponse(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    price_level: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    summary: Optional[str] = None
    average_trust_score: Optional[float] = None
    tags: List[str] = []

class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class AdminRestaurantCreate(BaseModel):
    name: str
    address: Optional[str] = None
    campusSlug: str
    category: Optional[str] = None
    priceLevel: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    phone: Optional[str] = None
    sourceUrl: Optional[str] = None
    externalId: Optional[str] = None


class AdminRestaurantUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    campusSlug: Optional[str] = None
    category: Optional[str] = None
    priceLevel: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    phone: Optional[str] = None
    sourceUrl: Optional[str] = None
    externalId: Optional[str] = None


class AnalysisJobCreate(BaseModel):
    restaurantId: int


class AnalysisJobResponse(BaseModel):
    jobId: str
    restaurantId: int
    restaurantName: str
    status: str
    progress: int
    createdAt: datetime
    completedAt: Optional[datetime] = None