import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models
from app.routers import campus, restaurant, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CSE DB Backend API")

# 허용 오리진: 기본 로컬 + 환경변수 ALLOWED_ORIGINS (콤마 구분)
_default_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]
_extra = os.environ.get("ALLOWED_ORIGINS", "")
allowed_origins = _default_origins + [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(campus.router)
app.include_router(restaurant.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "Backend server is running"}