# SKKU Gourmap

성균관대 자연과학/인문사회캠퍼스 인근 식당을 **카카오맵 기반 지도·리스트**로 탐색하고, LLM 기반 리뷰 신뢰도 분석 결과를 함께 보여주는 웹 서비스.

---

## 시스템 구성

```
프론트엔드 (React/Vite)  ──  Vite 개발 프록시  ──▶  백엔드 (FastAPI)
     포트 3000                                           포트 8000
                                                             │
                                                         SQLite DB
                                                      restaurant.db
```

---

## 기술 스택

### 프론트엔드

| 분류 | 기술 |
|---|---|
| UI | React 18 + TypeScript + Vite |
| 라우팅 | React Router v6 |
| 서버 상태 | TanStack Query v5 |
| 전역 상태 | Zustand v5 |
| HTTP | Axios |
| 폼 | react-hook-form + zod |
| 지도 | Kakao Maps JS SDK (services + clusterer) |
| 스타일 | CSS Modules |
| 배포 | Vercel |

### 백엔드

| 분류 | 기술 |
|---|---|
| 프레임워크 | FastAPI |
| ORM | SQLAlchemy |
| DB | SQLite (개발) / PostgreSQL (운영) |
| 인증 | JWT (PyJWT) |
| 서버 | uvicorn |
| 배포 | Render |

---

## 폴더 구조

```
SKKU-gourmap/
├── backend/                           # 백엔드
│   ├── app/
│   │   ├── routers/
│   │   │   ├── campus.py
│   │   │   ├── restaurant.py
│   │   │   └── admin.py
│   │   ├── services/
│   │   │   ├── recommendation_service.py
│   │   │   └── analysis_service.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── database.py
│   ├── data/                          # LLM 팀 CSV 데이터
│   │   ├── restaurants.csv
│   │   ├── restaurant_summaries.csv
│   │   ├── restaurant_tags.csv
│   │   ├── review_credibility_restaurant_scores.csv
│   │   └── review_credibility_review_level_scores.csv
│   ├── import_llm_data.py
│   ├── seed.py
│   ├── restaurant.db
│   ├── requirements.txt
│   └── render.yaml
│
└── src/                               # 프론트엔드
    ├── components/
    │   ├── common/                    # EmptyState, ErrorBoundary, ErrorMessage,
    │   │                             #   Loading, ReasonChips, Skeleton, TagBadge
    │   ├── filter/                    # FilterPanel
    │   ├── layout/                    # AdminLayout
    │   ├── map/                       # KakaoMap
    │   └── restaurant/                # RestaurantCard
    ├── config/
    │   ├── apiConfig.ts
    │   ├── appConfig.ts
    │   └── mapConfig.ts
    ├── hooks/
    │   ├── useDebounce.ts
    │   ├── useFilterParams.ts
    │   └── useKakaoLoader.ts
    ├── pages/
    │   ├── CampusSelectPage/
    │   ├── HomePage/
    │   ├── ListOnlyPage/
    │   ├── NotFoundPage/
    │   ├── RestaurantDetailPage/
    │   └── admin/
    │       ├── AdminAnalysesPage/
    │       ├── AdminDashboardPage/
    │       ├── AdminLoginPage/
    │       ├── AdminRestaurantsPage/
    │       └── AdminReviewsPage/
    ├── services/
    │   ├── adminService.ts
    │   ├── apiClient.ts
    │   └── restaurantService.ts
    ├── stores/
    │   └── authStore.ts
    ├── styles/
    ├── types/
    ├── App.tsx
    └── main.tsx
```

---

## 라우팅

```
/                        →  CampusSelectPage         캠퍼스 선택
/campus/:slug            →  HomePage                 지도 + 리스트
/campus/:slug/list       →  ListOnlyPage             지도 장애 시 fallback
/restaurants/:id         →  RestaurantDetailPage     식당 상세
/admin/login             →  AdminLoginPage
/admin/*                 →  AdminLayout (JWT 가드)
  /admin/dashboard       →  AdminDashboardPage
  /admin/restaurants     →  AdminRestaurantsPage
  /admin/reviews         →  AdminReviewsPage
  /admin/analyses        →  AdminAnalysesPage
```

`slug` = `natural` (자연과학캠퍼스) | `humanities` (인문사회캠퍼스)

---

## 백엔드 API

```
GET  /api/campuses/
GET  /api/campuses/{slug}/restaurants
GET  /api/campuses/{slug}/recommendations?category=&price_level=&mood=&parking=
GET  /api/restaurants/{id}

POST /api/admin/auth/login
GET  /api/admin/restaurants
POST /api/admin/restaurants
PUT  /api/admin/restaurants/{id}
DEL  /api/admin/restaurants/{id}
POST /api/admin/reviews/upload
GET  /api/admin/analysis-jobs
POST /api/admin/analysis-jobs
GET  /api/admin/analysis-jobs/{jobId}
```

---

## 실행 방법

### 사전 요구사항

| 항목 | 버전 |
|---|---|
| Node.js | 18 이상 |
| Python | 3.10 이상 |

### 1. 백엔드

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env

# DB 초기화 (최초 1회)
python import_llm_data.py

# 서버 실행
uvicorn app.main:app --reload --port 8000
```

Swagger UI: http://localhost:8000/docs

### 2. 프론트엔드

```bash
# 프로젝트 루트에서
npm install

# 환경변수 설정
cp .env.example .env
# VITE_KAKAO_MAP_KEY 에 카카오맵 JavaScript 키 입력
# VITE_API_BASE_URL 은 개발 환경에서 비워둘 것 (Vite 프록시 사용)

npm run dev
```

브라우저: http://localhost:3000

### 전체 실행 순서

```
1. backend/  →  venv 활성화 → pip install → .env 설정
2. backend/  →  python import_llm_data.py  (최초 1회)
3. backend/  →  uvicorn app.main:app --reload --port 8000
4. 루트      →  npm install → .env 설정
5. 루트      →  npm run dev
6. 브라우저  →  http://localhost:3000
```

### 관리자 접속

| 항목 | 값 |
|---|---|
| URL | http://localhost:3000/admin/login |
| 아이디 | `admin` |
| 비밀번호 | `password123` |

> 운영 환경에서는 `.env`의 `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET` 반드시 변경

---

## 환경변수

### 백엔드 (`backend/.env`)

| 변수 | 설명 | 기본값 |
|---|---|---|
| `ADMIN_USERNAME` | 관리자 아이디 | `admin` |
| `ADMIN_PASSWORD` | 관리자 비밀번호 | `password123` |
| `ADMIN_JWT_SECRET` | JWT 서명 키 | `dev-secret-change-me` |
| `DATABASE_URL` | DB 연결 문자열 (미설정 시 SQLite) | — |

### 프론트엔드 (`.env`)

| 변수 | 설명 |
|---|---|
| `VITE_KAKAO_MAP_KEY` | 카카오맵 JavaScript 앱 키 |
| `VITE_API_BASE_URL` | 백엔드 URL (개발 시 비워둠) |

---

## 구현 현황

### 완료

| 영역 | 기능 |
|---|---|
| 프론트 | 캠퍼스 선택, KakaoMap 마커·클러스터·오버레이 |
| 프론트 | 식당 목록·필터·정렬 (카테고리/가격/분위기/주차/웨이팅, URL 동기화) |
| 프론트 | 추천 점수 기반 정렬, 추천 근거 칩 표시 |
| 프론트 | 식당 상세 (AI 요약, 대표 메뉴, 분위기·주차·웨이팅 요약, 신뢰도 점수) |
| 프론트 | 지도 장애 fallback (ListOnlyPage), 스켈레톤 UI, 에러/빈 결과 처리 |
| 프론트 | 관리자 JWT 인증, 식당 CRUD, CSV 업로드, 분석 잡 폴링 |
| 백엔드 | 캠퍼스·식당 조회, 필터 추천 API |
| 백엔드 | 관리자 인증 (JWT), 식당 CRUD, CSV 업로드, 분석 잡 관리 |

### 남은 작업

| 항목 | 영역 |
|---|---|
| `review_credibility_restaurant_scores.csv` → `average_trust_score` DB 반영 스크립트 | 백엔드 |
| `credibility_label` 필드 추가 및 API 응답 포함 | 백엔드 |
| `waiting` 필터 파라미터 처리 | 백엔드 |
| 대시보드 리뷰 수 집계 API (`GET /admin/dashboard/stats`) | 백엔드 |
| SQLite → PostgreSQL 전환 (운영 환경) | 백엔드 |
| 대시보드 리뷰 수 실수치 표시 | 프론트 |
