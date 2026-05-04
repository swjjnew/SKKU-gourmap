# SKKU 맛집 지도 (Frontend)

성균관대학교 주변의 맛집을 카카오맵 위에 보여주는 웹사이트의 프론트엔드 코드입니다.

## 기술 스택

- **React 18** + **TypeScript**
- **Vite** (개발 서버 및 번들러)
- **React Router** v6 (라우팅)
- **Axios** (백엔드 API 호출)
- **Kakao Maps JavaScript SDK** (지도)
- **CSS Modules** (스타일링)

## 빠른 시작

```bash
# 1) 의존성 설치
npm install

# 2) 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 VITE_KAKAO_MAP_KEY, VITE_API_BASE_URL 을 채워 주세요.

# 3) 개발 서버 실행 (http://localhost:3000)
npm run dev

# 4) 프로덕션 빌드
npm run build
```

## 환경 변수

| 키 | 설명 |
| --- | --- |
| `VITE_KAKAO_MAP_KEY` | 카카오 개발자 콘솔에서 발급한 JavaScript 키 |
| `VITE_API_BASE_URL` | 백엔드 API 베이스 URL (예: `http://localhost:8080/api`) |
| `VITE_APP_NAME` | 앱 표시명 |

## 폴더 구조

```
SKKU-gourmetmap/
├── public/                       # 정적 파일 (favicon 등)
├── src/
│   ├── assets/                   # 이미지/아이콘
│   ├── components/               # 재사용 컴포넌트
│   │   ├── common/               # Loading, ErrorMessage 등 공통
│   │   ├── layout/               # Header, MainLayout
│   │   ├── map/                  # KakaoMap 등 지도 관련
│   │   └── restaurant/           # RestaurantList, RestaurantCard
│   ├── pages/                    # 라우트별 페이지
│   │   ├── HomePage/             # 메인(지도+리스트)
│   │   ├── RestaurantDetailPage/ # 맛집 상세
│   │   └── NotFoundPage/         # 404
│   ├── hooks/                    # 커스텀 훅 (useKakaoLoader 등)
│   ├── services/                 # API 호출 모듈
│   │   ├── apiClient.ts          # axios 인스턴스
│   │   ├── restaurantService.ts  # 맛집 API
│   │   └── categoryService.ts    # 카테고리 API
│   ├── config/                   # 설정값 (apiConfig, mapConfig)
│   ├── types/                    # TypeScript 타입 정의
│   ├── utils/                    # 유틸 함수 (format, geo, debounce)
│   ├── styles/                   # 전역 CSS
│   ├── App.tsx                   # 라우팅 정의
│   ├── main.tsx                  # 엔트리 포인트
│   ├── global.d.ts               # 카카오맵 SDK 전역 타입
│   └── vite-env.d.ts             # Vite 환경 변수 타입
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── .eslintrc.cjs
├── .env.example
└── .gitignore
```

## 주요 컴포넌트

| 위치 | 역할 |
| --- | --- |
| `components/map/KakaoMap.tsx` | 카카오맵 + 마커 렌더링 |
| `components/restaurant/RestaurantList.tsx` | 맛집 목록 |
| `components/restaurant/RestaurantCard.tsx` | 맛집 카드 한 개 |
| `components/layout/MainLayout.tsx` | 헤더 + 본문 레이아웃 |
| `pages/HomePage/HomePage.tsx` | 좌측 리스트 + 우측 지도의 메인 페이지 |
| `pages/RestaurantDetailPage/...` | 맛집 상세 페이지 |

## API 연동

`src/services/restaurantService.ts` 에 백엔드 API 호출 함수가 정의되어 있습니다.
백엔드 명세가 확정되면 다음 파일들을 동기화해 주세요.

- `src/config/apiConfig.ts` - 엔드포인트 경로
- `src/types/restaurant.ts` - 응답 모델
- `src/types/api.ts` - 공통 응답 형태

## 카카오맵 SDK

`src/hooks/useKakaoLoader.ts` 가 SDK를 동적으로 1회만 로드합니다.
`KakaoMap` 컴포넌트는 이 훅을 통해 SDK 준비 상태를 확인한 뒤 지도를 그립니다.
키가 없으면 에러 상태로 표시되니 `.env` 설정을 잊지 마세요.

## 다음 단계 (TODO)

- [ ] 디자인이 확정되면 색상/폰트 토큰 정리
- [ ] 검색창, 카테고리 필터 UI 추가
- [ ] 마커 클러스터링 활성화
- [ ] 지도 영역 변경 시 영역 내 맛집만 다시 조회 (`fetchRestaurantsByBounds`)
- [ ] 모바일 바텀시트 등 반응형 대응
- [ ] 즐겨찾기/리뷰 기능 (백엔드 스펙 확정 후)
