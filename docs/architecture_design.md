# SKKU Gourmap — 프론트엔드 아키텍처 설계 문서

> 작성 기준: 2026-05-19 / 프로토타입 완성 + 카카오맵 연결 시점

---

## 1. 기술 스택

| 분류 | 기술 | 선택 이유 |
|---|---|---|
| UI 프레임워크 | React 18 + TypeScript (strict) | 컴포넌트 재사용성, 타입 안정성 |
| 번들러 | Vite | 빠른 HMR, ESM 기반 개발 서버 |
| 라우팅 | React Router v6 | 선언적 라우팅, 중첩 라우트 지원 |
| 서버 상태 | TanStack Query | 캐싱, 재시도, 폴링 자동 처리 |
| 전역 UI 상태 | Zustand | 가볍고 boilerplate 없음 |
| HTTP 클라이언트 | Axios | 인터셉터 기반 에러 정규화 |
| 폼 | react-hook-form + zod | 성능, 타입 안전 유효성 검사 |
| 지도 | Kakao Maps JS SDK | 국내 서비스 최적화 |
| 스타일 | CSS Modules | 클래스 충돌 방지, 컴포넌트 단위 격리 |

---

## 2. 레이어 아키텍처

프론트엔드는 아래 6개 레이어로 구성된다. 위에서 아래로 갈수록 추상화 수준이 낮아지며, **상위 레이어는 하위 레이어만 참조**하는 단방향 의존 구조를 유지한다.

```
┌─────────────────────────────────────────────┐
│  LAYER 0  외부 시스템                         │
│  Kakao Maps SDK · Backend API · .env Keys   │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  LAYER 1  진입 · 라우팅                       │
│  main.tsx (BrowserRouter) → App.tsx (Routes)│
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  LAYER 2  페이지 (pages/)                    │
│  각 라우트에 1:1 대응하는 컨테이너 컴포넌트    │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  LAYER 3  상태 관리 3계층                     │
│  URL (React Router) · 서버(TanStack Query)  │
│  · 전역 UI (Zustand)                        │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  LAYER 4  공유 컴포넌트 (components/)         │
│  map/ · restaurant/ · layout/ · common/     │
│  · filter/                                  │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  LAYER 5  공유 인프라                         │
│  services/ · hooks/ · config/ · types/      │
│  · utils/                                   │
└─────────────────────────────────────────────┘
```

---

## 3. 라우팅 구조

```
/                          → CampusSelectPage        (FR-01)
/campus/:slug              → HomePage                (FR-02~07)
/campus/:slug/list         → ListOnlyPage            (NFR-R-04 fallback)
/restaurants/:id           → RestaurantDetailPage    (FR-05)
/admin/login               → AdminLoginPage          (FR-12)
/admin                     → AdminLayout (JWT 가드)
  /admin/dashboard         → AdminDashboardPage      (FR-13)
  /admin/restaurants       → AdminRestaurantsPage    (FR-13)
  /admin/reviews           → AdminReviewsPage        (FR-14)
  /admin/analyses          → AdminAnalysesPage       (FR-15)
```

- `:slug` 값은 `natural` / `humanities` 두 가지
- `/admin/*` 하위 라우트는 `AdminGuard` 컴포넌트로 JWT 유무를 확인하여, 토큰이 없으면 `/admin/login`으로 리다이렉트
- 지도 SDK 장애 시 `/campus/:slug/list`로 fallback CTA 노출 (NFR-R-04)

---

## 4. 상태 관리 3계층

### 4-1. URL 상태 — React Router

캠퍼스, 필터, 정렬처럼 **공유 가능하고 새로고침해도 유지되어야 하는 상태**를 URL에 저장한다.

```
/campus/natural?price=cheap&sort=score&category=korean
```

| URL 파라미터 | 의미 |
|---|---|
| `:slug` (path) | 선택한 캠퍼스 |
| `price` | 가격대 필터 |
| `sort` | 정렬 기준 |
| `category` | 음식 종류 필터 |
| `mood` | 분위기 필터 |
| `parking` | 주차 가능 여부 |
| `waiting` | 웨이팅 여부 |

- `useSearchParams` 훅으로 읽고 쓴다
- `useQueryParam` 유틸 훅으로 래핑하여 타입 안전하게 사용

### 4-2. 서버 상태 — TanStack Query

API 응답 캐싱, 재시도, 폴링을 담당한다.

```ts
// 기본 설정
{
  staleTime: 60_000,   // 1분간 캐시 신선 유지
  retry: 2,            // 실패 시 2회 재시도
  refetchOnWindowFocus: false,
}

// 분석 잡 폴링 (AdminAnalysesPage)
{
  refetchInterval: 5_000,  // 5초마다 상태 확인
}
```

### 4-3. 전역 UI 상태 — Zustand

URL·서버에 넣기 어색한 UI 토글과 인증 토큰만 보관한다.

```ts
// uiStore
interface UiStore {
  viewMode: 'map' | 'list';
  setViewMode: (mode: 'map' | 'list') => void;
}

// authStore
interface AuthStore {
  token: string | null;          // 메모리에만 저장 (localStorage 금지)
  setToken: (token: string) => void;
  clearToken: () => void;
  isAuthenticated: () => boolean;
}
```

---

## 5. 폴더 구조

```
src/
├── components/
│   ├── common/          # Loading, ErrorMessage, EmptyState
│   ├── layout/          # MainLayout, AdminLayout, Header
│   ├── map/             # KakaoMap, MarkerOverlay
│   ├── restaurant/      # RestaurantCard, RestaurantList, TagBadge, ReasonChips
│   └── filter/          # FilterPanel, filterDefs
├── pages/
│   ├── CampusSelectPage/
│   ├── HomePage/
│   ├── ListOnlyPage/
│   ├── RestaurantDetailPage/
│   ├── NotFoundPage/
│   └── admin/
│       ├── AdminLoginPage/
│       ├── AdminDashboardPage/
│       ├── AdminRestaurantsPage/
│       ├── AdminReviewsPage/
│       └── AdminAnalysesPage/
├── features/             # 도메인 단위 (api + hooks + types)
│   ├── campus/
│   ├── restaurant/
│   ├── filter/
│   ├── recommendation/
│   └── admin/
├── hooks/                # useKakaoLoader, useDebounce, useQueryParam
├── services/             # apiClient (axios), restaurantService, adminService
├── stores/               # uiStore, authStore (Zustand)
├── config/               # apiConfig, mapConfig (CAMPUS_CENTERS)
├── types/                # Restaurant, Campus, ApiError, Tag 등
├── utils/                # debounce, format, geo
└── styles/               # global.css
```

각 페이지 폴더는 `PageName.tsx` + `PageName.module.css` 1쌍을 유지한다.

---

## 6. 컴포넌트 설계 원칙

**1파일 1컴포넌트** 원칙과 동일명 `.module.css`를 함께 둔다.

```
RestaurantCard.tsx
RestaurantCard.module.css
```

컴포넌트는 세 종류로 구분한다.

| 종류 | 위치 | 특징 |
|---|---|---|
| 페이지 컴포넌트 | `pages/` | 라우트 1:1 대응, 상태 조합 담당 |
| 컨테이너 컴포넌트 | `features/` | 도메인 로직 + 훅 조합 |
| 표현 컴포넌트 | `components/` | props만 받아 렌더링, 재사용 가능 |

---

## 7. 카카오맵 설계

### SDK 로드 전략

`useKakaoLoader` 훅이 모듈 레벨의 `cachedPromise`를 공유하여 SDK를 **딱 1회만** 로드한다. 여러 컴포넌트가 동시에 훅을 호출해도 스크립트 태그가 중복 삽입되지 않는다.

```ts
let cachedPromise: Promise<void> | null = null;

function loadKakaoSdk(): Promise<void> {
  if (cachedPromise) return cachedPromise;  // 이미 로드 중이면 같은 Promise 반환
  cachedPromise = new Promise(/* 스크립트 주입 */);
  return cachedPromise;
}
```

### 캠퍼스별 초기 좌표

하드코딩 금지 (NFR-P-08). `config/mapConfig.ts`의 `CAMPUS_CENTERS` 객체에서만 참조한다.

```ts
export const CAMPUS_CENTERS = {
  natural:    { lat: 37.296364404283516, lng: 126.9708791573265, level: 4 },
  humanities: { lat: 37.58761640986565,  lng: 126.99372749860636, level: 4 },
} as const;
```

### 지도 이동 시 재조회

지도가 이동하거나 줌이 바뀌면 현재 화면 영역(bounds) 기준으로 식당을 재조회한다. `bounds_changed` 이벤트에 **300~500ms 디바운스**를 적용하여 API 과호출을 방지한다.

### 장애 격리

지도 영역과 리스트 영역을 **각자 독립된 ErrorBoundary**로 감싼다. 지도 SDK 로드 실패 시 리스트는 그대로 동작하며, SDK 에러 화면에 `/campus/:slug/list` 이동 CTA를 노출한다.

---

## 8. API 통신 레이어

```
컴포넌트 / 페이지
    ↓ useQuery / useMutation (TanStack Query)
features/*/hooks.ts
    ↓ 도메인 훅
services/restaurantService.ts
    ↓ 함수 호출
services/apiClient.ts  (axios 인스턴스)
    ↓ HTTP 요청
Backend API
```

`apiClient`의 응답 인터셉터가 모든 4xx/5xx를 `ApiError` 타입으로 정규화하므로, 상위 레이어는 에러 타입을 일일이 분기할 필요가 없다.

```ts
interface ApiError {
  status: number;
  code?: string;
  message: string;
}
```

---

## 9. 장애 · 에러 처리 전략

| 상황 | 처리 방식 |
|---|---|
| 카카오맵 SDK 로드 실패 | ErrorBoundary → "리스트 보기" CTA |
| API 4xx / 5xx | 표준 `ApiError` → 재시도 버튼 노출 |
| 빈 결과 | `EmptyState` 컴포넌트 → 필터 초기화 버튼 |
| 분석 데이터 없음 | `hasAnalysis === false` 조건 분기 → 플레이스홀더 (NFR-R-03) |

TanStack Query 기본 설정: `retry: 2`, `staleTime: 60s`

---

## 10. 보안 제약 (NFR)

| 제약 | 적용 방식 |
|---|---|
| 사용자 개인정보 수집 금지 (NFR-S-01) | 로그인 UI 없음, `geolocation` 사용 안 함 |
| GPS 수집 금지 (NFR-S-02) | `navigator.geolocation` 호출 코드 없음 |
| API Key 노출 금지 (NFR-S-08) | `VITE_*` 환경변수로만 주입, 코드에 하드코딩 금지 |
| 관리자 토큰 보안 | `localStorage` 저장 금지 → 메모리(`authStore`)에만 보관 |
| 캠퍼스 좌표 하드코딩 금지 (NFR-P-08) | `config/mapConfig.ts` 의 `CAMPUS_CENTERS`만 사용 |

---

## 11. 응답 시간 목표 (KPI)

| 액션 | 목표 |
|---|---|
| 지도 / 리스트 진입 | 3초 이내 |
| 마커 클릭 오버레이 | 1초 이내 |
| 단일 필터 적용 | 2초 이내 |
| 복수 필터 적용 | 3초 이내 |
| 식당 상세 진입 | 2초 이내 |

---

## 12. 개발 로드맵

| Phase | 내용 | 상태 |
|---|---|---|
| Phase 1 | CampusSelectPage + 라우팅 재구성 + 캠퍼스 좌표 분리 + 카카오맵 연결 | ✅ 완료 |
| Phase 2 | 지도 마커 오버레이 + 재조회 + 클러스터링 + RestaurantCard 확장 + ErrorBoundary | 🔲 진행 전 |
| Phase 3 | FilterPanel + URL 동기화 + TanStack Query 전환 + Zustand 스토어 | 🔲 진행 전 |
| Phase 4 | RestaurantDetailPage API 연결 + 분석 데이터 조건 분기 | 🔲 진행 전 |
| Phase 5 | AdminGuard + 관리자 CRUD + CSV 업로드 + 분석 잡 폴링 | 🔲 진행 전 |
| Phase 6 | Lighthouse QA + 접근성 + 장애 시나리오 테스트 | 🔲 진행 전 |
