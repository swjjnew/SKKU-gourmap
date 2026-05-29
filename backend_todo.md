# 백엔드 구현 필요 사항

프론트엔드 연결 완료 기준으로 백엔드에서 추가 구현이 필요한 항목 정리.

---

## 1. 버그 수정 (기존 코드)

### 1-1. 추천 API sort KeyError
**파일**: `backend/app/routers/restaurant.py` — 168번째 줄

```python
# 현재 (오류 발생)
result.sort(key=lambda x: x["recommendation_score"], reverse=True)

# 수정
result.sort(key=lambda x: x["recommendationScore"] or 0, reverse=True)
```

dict 키가 `"recommendationScore"`(camelCase)인데 sort에서 `"recommendation_score"`(snake_case)를 참조해 `KeyError` 발생. 현재 추천 엔드포인트가 500을 반환함.

### 1-2. CampusResponse에 slug 필드 누락
**파일**: `backend/app/schemas.py`

```python
# 현재
class CampusResponse(BaseModel):
    id: int
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_m: Optional[int] = None

# 수정
class CampusResponse(BaseModel):
    id: int
    slug: str          # 추가
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_m: Optional[int] = None
```

프론트엔드에서 캠퍼스 목록을 동적으로 사용하려면 slug 필드 필요.

---

## 2. 관리자 인증

### 엔드포인트
```
POST /api/admin/auth/login
```

### 요청
```json
{
  "username": "admin",
  "password": "password123"
}
```

### 응답
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### 구현 참고
- JWT 발급 (`python-jose` 또는 `PyJWT`)
- `main.py`에 admin 라우터 포함 필요: `app.include_router(admin.router)`
- 프론트엔드는 토큰을 메모리에 저장 후 이후 모든 admin 요청 헤더에 `Authorization: Bearer <token>` 첨부

---

## 3. 관리자 식당 CRUD

모든 엔드포인트는 `Authorization: Bearer <token>` 헤더 인증 필요.

### 3-1. 식당 목록 조회
```
GET /api/admin/restaurants
```
응답: `restaurant_to_frontend_item()` 형식의 배열

### 3-2. 식당 추가
```
POST /api/admin/restaurants
```
요청:
```json
{
  "name": "새 식당",
  "address": "경기도 수원시 ...",
  "campusSlug": "natural",
  "category": "한식",
  "priceLevel": "보통",
  "lat": 37.296,
  "lng": 126.971,
  "phone": "031-000-0000",
  "sourceUrl": "https://..."
}
```

### 3-3. 식당 수정
```
PUT /api/admin/restaurants/{id}
```
요청: 3-2와 동일 (부분 업데이트 허용)

### 3-4. 식당 삭제
```
DELETE /api/admin/restaurants/{id}
```
응답: `204 No Content`  
(실제 삭제 대신 `is_active = False` soft delete 권장)

---

## 4. 리뷰 CSV 업로드

```
POST /api/admin/reviews/upload
Content-Type: multipart/form-data
```

### CSV 컬럼 (필수)
```
restaurant_external_id, content, source_url
```

### 응답
```json
{
  "insertedCount": 120,
  "skippedCount": 5,
  "errorCount": 2,
  "errors": [
    "행 3: restaurant_external_id 'kakao_999' 없음"
  ]
}
```

### 구현 참고
- `restaurant_external_id`로 `restaurants.external_id` 조회 후 `restaurant_id` 매핑
- 중복 content는 skippedCount에 포함

---

## 5. 분석 잡 관리

### 5-1. 잡 목록 조회
```
GET /api/admin/analysis-jobs
```
응답:
```json
[
  {
    "jobId": "JOB-001",
    "restaurantId": 1,
    "restaurantName": "예시 파스타집",
    "status": "completed",
    "progress": 100,
    "createdAt": "2026-05-01T09:00:00Z",
    "completedAt": "2026-05-01T09:05:30Z"
  }
]
```

`status` 값: `"pending"` | `"running"` | `"completed"` | `"failed"`

### 5-2. 분석 잡 시작
```
POST /api/admin/analysis-jobs
```
요청:
```json
{ "restaurantId": 1 }
```
응답: 생성된 잡 객체 (5-1 형식)

### 5-3. 잡 상태 단건 조회 (폴링용)
```
GET /api/admin/analysis-jobs/{jobId}
```
응답: 5-1 형식의 단건 객체

### 구현 참고
- 프론트엔드는 `running` 또는 `pending` 잡이 있을 때 **5초 간격**으로 목록 엔드포인트를 폴링
- 분석 완료 시 `restaurant_summaries` 테이블 업데이트 → `hasAnalysis: true` 반영

---

## 6. main.py 업데이트 필요

```python
# 현재
app.include_router(campus.router)
app.include_router(restaurant.router)

# 추가 필요
from app.routers import admin
app.include_router(admin.router)
```

CORS에 프론트 개발 서버 포트 추가 확인 (현재 5173만 허용, 3000도 추가 권장):
```python
allow_origins=[
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
],
```
