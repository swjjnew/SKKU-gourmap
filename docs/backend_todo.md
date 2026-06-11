# 백엔드 구현 현황 및 잔여 사항

## ✅ 완료된 항목

### 버그 수정
- **추천 API sort KeyError 수정** — `x["recommendation_score"]` → `x["recommendationScore"] or 0`
- **CampusResponse에 `slug` 필드 추가** — 프론트엔드 캠퍼스 목록 동적 조회 가능

### 관리자 인증
- `POST /api/admin/auth/login` — JWT 발급, `ADMIN_USERNAME`/`ADMIN_PASSWORD` 환경변수 기반 인증

### 관리자 식당 CRUD
- `GET /api/admin/restaurants` — 전체 식당 목록
- `POST /api/admin/restaurants` — 식당 추가 (externalId 자동 생성 또는 직접 지정)
- `PUT /api/admin/restaurants/{id}` — 식당 수정
- `DELETE /api/admin/restaurants/{id}` — soft delete (`is_active = False`)

### 리뷰 CSV 업로드
- `POST /api/admin/reviews/upload` — CSV 업로드 (UTF-8, 중복 skip, 오류 행 보고)
- `Review` 모델 추가 (`reviews` 테이블)

### 분석 잡 관리
- `GET /api/admin/analysis-jobs` — 잡 목록 (최신순)
- `POST /api/admin/analysis-jobs` — 분석 잡 생성 + BackgroundTask로 더미 완료 처리
- `GET /api/admin/analysis-jobs/{job_id}` — 잡 단건 조회
- `AnalysisJob` 모델 추가 (`analysis_jobs` 테이블)

### 인프라
- `main.py`에 admin 라우터 포함
- CORS: `localhost:3000`, `localhost:5173` 모두 허용

---

## ❌ 잔여 구현 필요 사항

### 1. `waiting` 필터 파라미터 지원
**파일**: `backend/app/routers/restaurant.py` — `get_recommendations_by_campus_slug`

```python
# 추가 필요
waiting: bool | None = Query(None),

# 필터 로직
if waiting is True and ("웨이팅없음" in tag_values or "no_waiting" in tag_values):
    score += 15
    reasons.append("웨이팅이 적은 편입니다.")
```

현재 프론트엔드는 파라미터를 전송하지만 백엔드가 무시하고 있어 필터 적용이 안 됨.

### 2. 관리자 대시보드 리뷰 수 집계 API
**새 엔드포인트** 또는 기존 응답에 추가:

```
GET /api/admin/dashboard/stats
```

응답:
```json
{
  "restaurantCount": 148,
  "reviewCount": 2341,
  "analyzedCount": 112,
  "pendingCount": 36
}
```

현재 프론트엔드 AdminDashboardPage에서 리뷰 수가 "—"로 표시됨.

### 3. 실제 LLM 분석 연동
현재 분석 잡(`POST /api/admin/analysis-jobs`)은 BackgroundTask로 더미 완료 처리만 함.
실제 LLM/Data 모듈과 연동하여 `restaurant_summaries` 테이블을 갱신하는 파이프라인 필요.

### 4. SQLite → PostgreSQL 전환 (운영 환경)
`backend/app/database.py`의 `DATABASE_URL`을 환경변수로 전환하고 PostgreSQL 연결 설정 추가.

---

## 참고: 프론트엔드 연동 현황

| 엔드포인트 | 프론트 연결 | 비고 |
|---|---|---|
| `GET /api/campuses/` | ✅ CampusSelectPage (하드코딩 대체 가능) | slug 이제 정상 반환 |
| `GET /api/campuses/{slug}/restaurants` | ✅ HomePage, ListOnlyPage | sort 프론트 처리 |
| `GET /api/campuses/{slug}/recommendations` | ✅ HomePage, ListOnlyPage | waiting 미적용 |
| `GET /api/restaurants/{id}` | ✅ RestaurantDetailPage | |
| `POST /api/admin/auth/login` | ✅ AdminLoginPage | |
| `GET /api/admin/restaurants` | ✅ AdminRestaurantsPage | |
| `POST /api/admin/restaurants` | ✅ AdminRestaurantsPage | |
| `PUT /api/admin/restaurants/{id}` | ✅ AdminRestaurantsPage | |
| `DELETE /api/admin/restaurants/{id}` | ✅ AdminRestaurantsPage | |
| `POST /api/admin/reviews/upload` | ✅ AdminReviewsPage | |
| `GET /api/admin/analysis-jobs` | ✅ AdminAnalysesPage | |
| `POST /api/admin/analysis-jobs` | ✅ AdminAnalysesPage | |
| `GET /api/admin/analysis-jobs/{id}` | ✅ AdminAnalysesPage (폴링) | |
| `GET /api/admin/dashboard/stats` | ❌ 미구현 | 리뷰 수 "—" 표시 중 |
