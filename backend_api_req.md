# SKKU Gourmap — 백엔드 API 요구사항 명세

> 프론트엔드 기준 작성 / 백엔드(FastAPI + PostgreSQL + SKT A.X) 팀과 협의 후 확정 필요  
> 확정 시 `src/config/apiConfig.ts`, `src/types/`, `src/services/` 동기화

---

## 공통 규칙

### Base URL

```
개발: http://localhost:8080/api
운영: 협의 후 결정 (VITE_API_BASE_URL 환경변수로 주입)
```

### 응답 포맷 (모든 엔드포인트 공통)

성공 시:

```json
{
  "success": true,
  "data": { /* 실제 데이터 */ }
}
```

실패 시:

```json
{
  "success": false,
  "error": {
    "code": "RESTAURANT_NOT_FOUND",
    "message": "해당 식당을 찾을 수 없습니다."
  }
}
```

- `code` 필드는 프론트에서 에러 종류별 메시지 분기에 사용
- HTTP 상태 코드는 표준 준수 (200, 400, 401, 404, 500)

### 페이지네이션

목록 응답은 아래 구조를 따른다.

```json
{
  "success": true,
  "data": {
    "content": [ /* 항목 배열 */ ],
    "page": 0,
    "size": 20,
    "totalElements": 148,
    "totalPages": 8,
    "hasNext": true
  }
}
```

### 인증

관리자 API는 요청 헤더에 JWT를 포함한다.

```
Authorization: Bearer <token>
```

일반 사용자 API는 인증 불필요. 개인정보·GPS 미수집 원칙.

---

## 1. 캠퍼스

### `GET /campuses`

캠퍼스 목록 조회. CampusSelectPage에서 호출.

**응답**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "natural",
      "name": "자연과학캠퍼스",
      "lat": 37.296364404283516,
      "lng": 126.9708791573265
    },
    {
      "id": 2,
      "slug": "humanities",
      "name": "인문사회캠퍼스",
      "lat": 37.58761640986565,
      "lng": 126.99372749860636
    }
  ]
}
```

> `slug` 값은 프론트 라우트의 `:slug`와 정확히 일치해야 한다 (`natural` / `humanities`).

---

## 2. 식당 목록

### `GET /campuses/:slug/restaurants`

캠퍼스별 식당 목록 조회. HomePage 리스트 + 지도 마커에서 사용.

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `page` | number | N | 페이지 번호 (0-indexed, 기본값 0) |
| `size` | number | N | 페이지 크기 (기본값 20) |
| `sort` | string | N | 정렬 기준: `score`(추천점수), `name`, `price` |
| `category` | string | N | 음식 종류 (예: `korean`, `chinese`, `japanese`) |
| `price` | string | N | 가격대: `cheap`, `normal`, `expensive` |
| `mood` | string | N | 분위기 (예: `quiet`, `lively`) |
| `parking` | boolean | N | 주차 가능 여부 |
| `waiting` | boolean | N | 웨이팅 없는 곳만 |
| `swLat` | number | N | 지도 영역 남서쪽 위도 (bounds 조회 시) |
| `swLng` | number | N | 지도 영역 남서쪽 경도 |
| `neLat` | number | N | 지도 영역 북동쪽 위도 |
| `neLng` | number | N | 지도 영역 북동쪽 경도 |

> bounds 파라미터가 있으면 해당 지도 영역 안의 식당만 반환한다.

**응답 항목 (`RestaurantListItem`)**

```json
{
  "id": 1,
  "campusId": 1,
  "campusSlug": "natural",
  "name": "맛있는 한식당",
  "category": "한식",
  "categoryCode": "korean",
  "address": "경기도 수원시 장안구 ...",
  "lat": 37.2971,
  "lng": 126.9724,
  "priceRange": "normal",
  "priceLabel": "보통",
  "tags": [
    { "id": 1, "name": "가성비", "color": "#FCD34D" },
    { "id": 2, "name": "웨이팅 없음", "color": "#6EE7B7" }
  ],
  "thumbnailUrl": "https://...",
  "summary": "재료가 신선하고 반찬이 다양한 한식당입니다.",
  "recommendationScore": 88,
  "recommendationReasons": [
    "리뷰의 92%가 맛에 만족",
    "가격 대비 양이 많다는 의견 다수",
    "주차 공간 여유로움"
  ],
  "hasAnalysis": true,
  "parking": true,
  "waiting": false
}
```

**필드 설명**

| 필드 | 설명 |
|---|---|
| `priceRange` | 코드값: `cheap` / `normal` / `expensive` |
| `priceLabel` | 화면 표시용: `저렴함` / `보통` / `비쌈` |
| `tags` | 최대 5개 권장. 마커 오버레이에 3개까지 표시 |
| `summary` | AI가 생성한 한 줄 요약 (최대 100자) |
| `recommendationScore` | 0~100 정수. **계산은 백엔드**, 프론트는 표시만 |
| `recommendationReasons` | 추천 근거 자연어 문장 배열 (최대 5개) |
| `hasAnalysis` | `false`면 summary, score, reasons 가 null일 수 있음 |

---

## 3. 식당 상세

### `GET /restaurants/:id`

식당 상세 페이지(`RestaurantDetailPage`)에서 사용.

**응답 (`RestaurantDetail`)**

```json
{
  "id": 1,
  "campusId": 1,
  "campusSlug": "natural",
  "name": "맛있는 한식당",
  "category": "한식",
  "categoryCode": "korean",
  "address": "경기도 수원시 장안구 ...",
  "lat": 37.2971,
  "lng": 126.9724,
  "priceRange": "normal",
  "priceLabel": "보통",
  "phone": "031-000-0000",
  "openingHours": "11:00 ~ 21:00 (브레이크 15:00~17:00)",
  "closedDays": "매주 일요일",
  "thumbnailUrl": "https://...",
  "imageUrls": ["https://...", "https://..."],
  "tags": [
    { "id": 1, "name": "가성비", "color": "#FCD34D" }
  ],
  "summary": "재료가 신선하고 반찬이 다양한 한식당입니다.",
  "recommendationScore": 88,
  "recommendationReasons": [
    "리뷰의 92%가 맛에 만족",
    "가격 대비 양이 많다는 의견 다수"
  ],
  "hasAnalysis": true,
  "reviewPoints": [
    { "label": "맛", "score": 4.5, "description": "대부분의 리뷰어가 맛에 만족" },
    { "label": "가격", "score": 4.0, "description": "적절한 가격대" },
    { "label": "서비스", "score": 3.8, "description": "보통 수준" },
    { "label": "분위기", "score": 4.2, "description": "조용하고 쾌적함" }
  ],
  "analysisMetadata": {
    "analyzedAt": "2026-05-10T14:30:00Z",
    "reviewCount": 127,
    "reliabilityRate": 0.91
  },
  "parking": true,
  "waiting": false,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-05-10T14:30:00Z"
}
```

**`hasAnalysis === false` 시 처리**

아래 필드들이 `null`로 내려와도 프론트가 처리한다. 별도 에러 응답을 주지 않는다.

- `summary` → `null`
- `recommendationScore` → `null`
- `recommendationReasons` → `[]` 또는 `null`
- `reviewPoints` → `[]` 또는 `null`
- `analysisMetadata` → `null`

---

## 4. 필터 옵션

### `GET /filter-options`

FilterPanel에서 동적으로 필터 선택지를 불러올 때 사용. 캠퍼스마다 다를 수 있으므로 slug 파라미터 지원 권장.

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `slug` | string | N | 캠퍼스 slug. 미지정 시 전체 |

**응답**

```json
{
  "success": true,
  "data": {
    "categories": [
      { "code": "korean", "label": "한식" },
      { "code": "chinese", "label": "중식" },
      { "code": "japanese", "label": "일식" },
      { "code": "western", "label": "양식" },
      { "code": "cafe", "label": "카페/디저트" }
    ],
    "priceRanges": [
      { "code": "cheap", "label": "저렴함" },
      { "code": "normal", "label": "보통" },
      { "code": "expensive", "label": "비쌈" }
    ],
    "moods": [
      { "code": "quiet", "label": "조용한" },
      { "code": "lively", "label": "활기찬" },
      { "code": "date", "label": "데이트" },
      { "code": "group", "label": "단체" }
    ]
  }
}
```

---

## 5. 관리자 인증

### `POST /admin/auth/login`

**요청**

```json
{
  "username": "admin",
  "password": "password"
}
```

**응답**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "expiresIn": 3600
  }
}
```

> 프론트는 `accessToken`을 메모리(`authStore`)에만 저장한다. `localStorage` 사용 금지.  
> `expiresIn`(초)을 기준으로 자동 로그아웃 타이머를 설정할 수 있다.

---

## 6. 관리자 — 식당 관리

### `GET /admin/restaurants`

목록 조회. 쿼리 파라미터: `page`, `size`, `slug`(캠퍼스 필터), `keyword`(이름 검색)

### `POST /admin/restaurants`

식당 등록.

**요청**

```json
{
  "campusSlug": "natural",
  "name": "새 식당",
  "category": "korean",
  "address": "경기도 수원시 ...",
  "lat": 37.2971,
  "lng": 126.9724,
  "priceRange": "normal",
  "phone": "031-000-0000",
  "openingHours": "11:00 ~ 21:00",
  "closedDays": "일요일",
  "parking": true,
  "waiting": false,
  "tagIds": [1, 2]
}
```

### `PUT /admin/restaurants/:id`

식당 수정. 요청 바디는 POST와 동일.

### `DELETE /admin/restaurants/:id`

식당 삭제.

---

## 7. 관리자 — 리뷰 관리

### `GET /admin/reviews`

**쿼리 파라미터**: `page`, `size`, `restaurantId`, `status`(`normal` / `flagged`)

**응답 항목**

```json
{
  "id": 101,
  "restaurantId": 1,
  "restaurantName": "맛있는 한식당",
  "content": "음식이 정말 맛있고...",
  "reliabilityScore": 0.92,
  "status": "normal",
  "createdAt": "2026-04-01T10:00:00Z"
}
```

### `DELETE /admin/reviews/:id`

리뷰 삭제.

---

## 8. 관리자 — 분석 관리

### `GET /admin/analyses`

분석 잡 목록 조회.

**응답 항목**

```json
{
  "jobId": "JOB-001",
  "restaurantId": 1,
  "restaurantName": "맛있는 한식당",
  "status": "completed",
  "progress": 100,
  "createdAt": "2026-05-17T09:00:00Z",
  "completedAt": "2026-05-17T09:05:00Z"
}
```

`status` 값: `pending` / `running` / `completed` / `failed`

> 프론트는 `status === 'running'`인 잡이 있으면 5초 간격으로 이 API를 폴링한다.

### `POST /admin/analyses/upload`

CSV 업로드로 분석 잡 생성.

**요청**: `multipart/form-data`

| 필드 | 타입 | 설명 |
|---|---|---|
| `file` | File | 리뷰 데이터 CSV |
| `restaurantId` | number | 분석 대상 식당 ID |

**CSV 컬럼 규격** (백엔드 팀과 협의 필요)

```
review_id, restaurant_id, content, source, created_at
```

**응답**

```json
{
  "success": true,
  "data": {
    "jobId": "JOB-004",
    "status": "pending"
  }
}
```

### `GET /admin/analyses/:jobId`

특정 잡 상세 조회. 진행률 폴링용.

---

## 9. 에러 코드 목록

프론트가 분기 처리하는 에러 코드 목록. 백엔드와 사전 합의 필요.

| `code` | HTTP 상태 | 의미 |
|---|---|---|
| `CAMPUS_NOT_FOUND` | 404 | 존재하지 않는 캠퍼스 slug |
| `RESTAURANT_NOT_FOUND` | 404 | 존재하지 않는 식당 ID |
| `ANALYSIS_NOT_READY` | 200 | 분석 미완료 (에러 아님, hasAnalysis: false) |
| `INVALID_FILTER` | 400 | 잘못된 필터 파라미터 |
| `UNAUTHORIZED` | 401 | 관리자 인증 토큰 없음 / 만료 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `UPLOAD_FAILED` | 500 | CSV 업로드 실패 |
| `JOB_FAILED` | 200 | 분석 잡 실패 (status: failed) |

---

## 10. 프론트 연동 포인트 요약

| 화면 | 호출 API | 비고 |
|---|---|---|
| CampusSelectPage | `GET /campuses` | 선택지 동적 로딩 |
| HomePage 초기 진입 | `GET /campuses/:slug/restaurants` | 기본 목록 |
| 지도 이동 시 | `GET /campuses/:slug/restaurants?swLat=...` | bounds 파라미터 추가 |
| 필터 적용 시 | `GET /campuses/:slug/restaurants?category=...` | 쿼리 파라미터 조합 |
| RestaurantDetailPage | `GET /restaurants/:id` | |
| AdminLoginPage | `POST /admin/auth/login` | |
| AdminRestaurantsPage | CRUD `/admin/restaurants` | |
| AdminReviewsPage | `GET/DELETE /admin/reviews` | |
| AdminAnalysesPage | `GET /admin/analyses` + 폴링 | 5초 간격 |
| AdminAnalysesPage | `POST /admin/analyses/upload` | CSV multipart |
