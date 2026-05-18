# SKKU Gourmap — Frontend

성균관대 자연과학/인문사회캠퍼스 인근 식당을, LLM 기반 **리뷰 신뢰도 분석 결과**와 함께 지도·리스트로 보여주는 웹 서비스의 프론트엔드.

> 백엔드(FastAPI + PostgreSQL + SKT A.X)는 별도 저장소. 프론트는 **DB에 사전 저장된 분석 결과**를 API로 조회만 한다. **실시간 LLM 추론 없음** (`PR-D-23`).

---

## 기술 스택

- React 18 + TypeScript (strict) + Vite
- React Router v6 / Axios / CSS Modules
- Kakao Maps JS SDK (services + clusterer)
- 추가 도입 권장: **TanStack Query** (서버 상태) + **Zustand** (UI 토글 등)

```bash
npm i @tanstack/react-query zustand react-hook-form zod clsx
```

---

## 프론트엔드 책임 범위 (요구사항 매핑)

| FR | 화면/기능 | 비고 |
|---|---|---|
| FR-01 | 캠퍼스 선택 (자연과학/인문사회) | 진입 시 첫 화면 |
| FR-02~04 | 캠퍼스별 식당 지도/리스트 | 마커 + 카드 |
| FR-05 | 식당 상세 (AI 요약, 핵심 리뷰 포인트) | 모달 or 라우트 |
| FR-06 | 필터 입력 (음식/가격/분위기/주차/웨이팅) | URL 쿼리 동기화 |
| FR-07 | 추천 점수 반영 정렬 | **계산은 백엔드**, 프론트는 표시만 |
| FR-08 | 추천 근거 표시 (자연어 문장 칩) | 카드/상세 양쪽 |
| FR-12~15 | 관리자 인증 + 데이터/분석 관리 | `/admin/*`, JWT 가드 |
| FR-16 | 오류/빈 결과/장애 처리 | 명확한 안내 메시지 |

### 꼭 지켜야 하는 비기능 요구사항

- **NFR-R-04**: 지도 API 죽어도 리스트는 살아야 한다 → `/list` fallback 라우트 분리
- **NFR-R-03**: 분석 결과 없어도 기본 정보는 표시 → "분석 정보가 아직 없습니다" 플레이스홀더
- **NFR-S-01/02**: 일반 사용자 개인정보·GPS 수집 금지 → 로그인 UI X, `geolocation` 사용 X
- **NFR-S-08**: API Key는 `.env`로만 (`VITE_KAKAO_MAP_KEY` 등)
- **NFR-P-08**: 캠퍼스 좌표 하드코딩 금지 → `config/mapConfig.ts`로 분리

### 응답 시간 목표 (KPI)

- 지도/리스트 진입 3초 / 마커 클릭 1초 / 필터 적용 2초 (복수 3초) / 상세 2초

---

## 라우팅 (확장 후)

```
/                              → CampusSelectPage         (FR-01)
/campus/:slug                  → HomePage (지도+리스트)   (FR-02~07)
/campus/:slug/list             → ListOnlyPage (지도 장애 대응, NFR-R-04)
/restaurants/:id               → RestaurantDetailPage     (FR-05)
/admin/login                   → AdminLoginPage           (FR-12)
/admin/*                       → AdminGuard 적용 영역     (FR-13~15)
```

`slug`는 `natural` / `humanities` 권장.

---

## 폴더 구조 (현재 + 신규)

```
src/
├── components/      # 순수 UI 조각
│   ├── common/      # Loading, ErrorMessage, EmptyState
│   ├── layout/      # MainLayout, AdminLayout
│   ├── map/         # KakaoMap, MarkerOverlay
│   └── restaurant/  # RestaurantCard, RestaurantList, TagBadge, ReasonChips
├── features/        # ⭐ 도메인 단위 (신규)
│   ├── campus/      # api, hooks, types
│   ├── restaurant/  # api, hooks, types
│   ├── filter/      # FilterPanel, filterDefs, URL sync
│   ├── recommendation/  # ReasonList (FR-08)
│   └── admin/       # auth, changeLog
├── pages/
│   ├── CampusSelectPage/    # ⭐ 신규 (FR-01)
│   ├── HomePage/
│   ├── ListOnlyPage/        # ⭐ 신규 (NFR-R-04)
│   ├── RestaurantDetailPage/
│   ├── NotFoundPage/
│   └── admin/               # ⭐ 신규 (Login, Dashboard, Restaurant/Review/Analysis Page)
├── hooks/           # useKakaoLoader, useDebounce, useQueryParam
├── services/        # apiClient (axios 인스턴스 + 인터셉터)
├── stores/          # ⭐ Zustand: uiStore, authStore
├── config/          # apiConfig, mapConfig (CAMPUS_CENTERS)
├── types/           # api, restaurant, campus, tag
├── utils/
└── styles/
```

---

## 상태 관리 3계층

| 계층 | 도구 | 무엇을 보관 |
|---|---|---|
| URL | React Router | 캠퍼스, 필터, 정렬 (`?campus=natural&price=cheap`) |
| 서버 상태 | TanStack Query | API 응답 캐싱/재시도 |
| 전역 UI | Zustand | 지도/리스트 토글, 관리자 토큰(메모리) |

> **로그인 없는 빠른 탐색**이 원칙이므로 전역 상태는 가볍게. 필터/캠퍼스는 URL이 단일 진실.

---

## 백엔드 API (가정, 확정 시 동기화)

```
GET  /campuses                                    → Campus[]
GET  /campuses/:slug/restaurants?filters=&sort=   → PageResponse<RestaurantListItem>
GET  /restaurants/:id                             → RestaurantDetail
GET  /filter-options                              → FilterOption[]

POST /admin/auth/login                            (FR-12)
... /admin/restaurants | /reviews | /analyses     (FR-13~15)
```

응답 모델 핵심 필드:

```ts
interface RestaurantListItem {
  id: number; campusId: number;
  name: string; category: string; lat: number; lng: number;
  priceRange?: '저렴함' | '보통' | '비쌈';
  tags: Tag[];
  summary?: string;                  // AI 요약
  recommendationScore?: number;      // 정렬 기준 (FR-07)
  recommendationReasons?: string[];  // 추천 근거 (FR-08)
  hasAnalysis: boolean;              // false → "분석 정보 없음"
}
```

> 확정되면 `config/apiConfig.ts`, `types/`, `services/`, `features/*/api.ts`를 한 번에 동기화. OpenAPI 스펙 있으면 `openapi-typescript` 권장.

---

## 카카오맵 규칙 (요약)

1. SDK는 `useKakaoLoader`로 1회만 로드 (services + clusterer 동시).
2. 키는 `.env`로만. 비어 있으면 `/list` fallback CTA 노출.
3. 캠퍼스별 좌표는 `config/mapConfig.ts`의 `CAMPUS_CENTERS`에 객체로 (하드코딩 금지).
4. 마커 클릭 오버레이는 가볍게 (이름 + 점수 + 태그 3개 + 한 줄 요약). 상세는 별도 라우트.
5. 지도 이동/줌 자동 재조회는 300~500ms 디바운스.

```ts
export const CAMPUS_CENTERS = {
  natural:    { lat: 37.2939, lng: 126.9769, level: 4 },
  humanities: { lat: 37.5870, lng: 126.9990, level: 4 },
} as const;
```

---

## 에러/장애 대응

| 상황 | 처리 |
|---|---|
| 지도 SDK 로드 실패 | "지도를 불러올 수 없습니다" + 리스트 보기 CTA |
| API 4xx/5xx | 표준화된 도메인 에러 → 재시도 버튼 |
| 빈 결과 | "조건에 맞는 식당이 없습니다" + 필터 초기화 |
| 분석 데이터 없음 | "분석 정보가 아직 없습니다" 플레이스홀더 |

- 지도와 리스트는 **각자의 ErrorBoundary**로 분리해서 한쪽이 죽어도 다른 쪽은 살아 있게.
- TanStack Query: `retry: 2`, `staleTime: 60s` 기본.

---

## 보안 / 개인정보 (프론트)

- 비밀키 절대 코드 X → `VITE_*` env만.
- 관리자 토큰은 httpOnly 쿠키 권장, 차선책 메모리. **localStorage 금지**.
- 사용자 개인정보, GPS, 트래커(GA 등) **수집/사용 금지**.

---

## 개발 로드맵 (Incremental)

- **Phase 1** — `CampusSelectPage` + 라우팅 재구성 + 캠퍼스 좌표 분리
- **Phase 2** — 지도/리스트에 태그·점수·요약·근거 슬롯 추가 + `ListOnlyPage`
- **Phase 3** — `FilterPanel` + URL 동기화 + TanStack Query 도입 + `ReasonList`
- **Phase 4** — 상세 페이지에 핵심 리뷰 포인트/분석 메타/플레이스홀더
- **Phase 5** — 관리자 영역 (JWT 가드, CRUD 폼, CSV 업로드, 분석 잡 폴링)
- **Phase 6** — Lighthouse/접근성/장애 시나리오 QA

---

## 빠른 시작

```bash
npm install
cp .env.example .env   # VITE_KAKAO_MAP_KEY, VITE_API_BASE_URL 채우기

npm run dev            # http://localhost:3000
npm run type-check
npm run lint
npm run build && npm run preview
```

---

## 컨벤션

- 1파일 1컴포넌트 + 동일명 `.module.css`. PascalCase.
- import는 `@components/*`, `@pages/*` alias 사용.
- `any` / 인라인 스타일 / `console.log` 잔존 금지.
- 주요 기능 코드 상단 주석에 요구사항 ID 인용 (`// FR-07`).

---

## 참고

- 요구사항 명세서: `요구사항 명세서_최종.pdf`
- Kakao Maps: https://apis.map.kakao.com/web/documentation/
- TanStack Query: https://tanstack.com/query/latest
