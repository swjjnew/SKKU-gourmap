from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class Campus(Base):
    __tablename__ = "campuses"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    radius_m = Column(Integer, default=1500)

    restaurants = relationship("Restaurant", back_populates="campus")

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    campus_id = Column(Integer, ForeignKey("campuses.id"), nullable=False)

    name = Column(String, nullable=False)
    address = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    category = Column(String)
    price_level = Column(String)

    phone = Column(String)
    source_url = Column(String)
    external_id = Column(String, unique=True, nullable=True, index=True)

    is_active = Column(Boolean, default=True)

    campus = relationship("Campus", back_populates="restaurants")
    summary = relationship("RestaurantSummary", back_populates="restaurant", uselist=False)
    tags = relationship("RestaurantTag", back_populates="restaurant")
    reviews = relationship("Review", back_populates="restaurant")
    analysis_jobs = relationship("AnalysisJob", back_populates="restaurant")
    

class RestaurantSummary(Base):
    __tablename__ = "restaurant_summaries"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)

    summary_text = Column(Text)
    representative_menu = Column(String)
    mood_summary = Column(String)
    parking_summary = Column(String)
    waiting_summary = Column(String)
    average_trust_score = Column(Float, default=0)

    restaurant = relationship("Restaurant", back_populates="summary")


class RestaurantTag(Base):
    __tablename__ = "restaurant_tags"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)

    tag_type = Column(String, nullable=False)
    tag_value = Column(String, nullable=False)
    confidence_score = Column(Float, default=1.0)

    restaurant = relationship("Restaurant", back_populates="tags")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    source_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    restaurant = relationship("Restaurant", back_populates="reviews")


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    job_id = Column(String, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False, index=True)
    status = Column(String, default="pending")  # pending | running | completed | failed
    progress = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    restaurant = relationship("Restaurant", back_populates="analysis_jobs")