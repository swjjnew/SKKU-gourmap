# SKKU Gourmap — 실행 가이드

## 시스템 구성

```
프론트엔드 (React/Vite) ─── Vite 개발 프록시 ──▶ 백엔드 (FastAPI)
    포트 3000                                         포트 8000
                                                          │
                                                      SQLite DB
                                                  restaurant.db
```

---

## 사전 요구사항

| 항목 | 버전 | 확인 명령어 |
|---|---|---|
| Node.js | 18 이상 | `node -v` |
| Python | 3.10 이상 | `python --version` |
| pip | 최신 | `pip --version` |

---

## 1. 백엔드 실행

### 1-1. 디렉토리 이동

```bash
cd CSE_db_backend/backend
```

### 1-2. 가상환경 생성 및 활성화

```bash
# macOS / Linux
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 1-3. 패키지 설치

```bash
pip install -r requirements.txt
```

### 1-4. 환경변수 설정

`.env.example`을 복사해 `.env` 파일을 만든다.

```bash
cp .env.example .env
```

`.env` 파일 내용 (개발 환경 기본값):

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password123
ADMIN_JWT_SECRET=change-this-secret-in-production
```

> **주의:** `DATABASE_URL`을 설정하지 않으면 SQLite(`restaurant.db`)를 사용한다.
> PostgreSQL을 사용하려면 주석 처리된 `DATABASE_URL`을 수정한다.

### 1-5. 데이터베이스 초기화 및 기초 데이터 임포트

```bash
# LLM/Data 팀이 제공한 식당·요약·태그 CSV 임포트
python import_llm_data.py
```

이 명령은 다음 파일을 순서대로 처리한다:
- `data/restaurants.csv` → `restaurants` 테이블
- `data/restaurant_summaries.csv` → `restaurant_summaries` 테이블
- `data/restaurant_tags.csv` → `restaurant_tags` 테이블

### 1-6. 신뢰도 점수 임포트 (LLM 팀 산출물)

LLM 파인튜닝 팀에게서 전달받은 파일을 `data/` 폴더에 복사한다:

```bash
# review_credibility_restaurant_scores.csv 를 data/ 폴더에 복사
cp review_credibility_restaurant_scores.csv data/
```

> 이 파일은 식당별 `average_trust_score`(0~100)와 신뢰도 등급(`credibility_label`, 1~5)을 포함한다.
> 현재는 `import_llm_data.py`의 `restaurant_summaries.csv`를 통해 일부 반영된다.
> 별도 스크립트로 직접 임포트하는 작업은 백엔드 남은 작업 항목을 참고.

### 1-7. 서버 실행

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

서버가 정상 실행되면 다음에서 확인할 수 있다:
- API 루트: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

---

## 2. 프론트엔드 실행

### 2-1. 디렉토리 이동

```bash
cd SKKU-gourmap
```

### 2-2. 패키지 설치

```bash
npm install
```

### 2-3. 환경변수 설정

`.env.example`을 복사해 `.env` 파일을 만든다.

```bash
cp .env.example .env
```

`.env` 파일 수정:

```env
# 카카오맵 JavaScript 키 (https://developers.kakao.com 에서 발급)
VITE_KAKAO_MAP_KEY=발급받은_키_입력

# 개발 환경에서는 비워두거나 아래 주석 처리
# VITE_API_BASE_URL=
```

> **중요:** 개발 환경에서는 `VITE_API_BASE_URL`을 **비워두거나 제거**한다.
> Vite 개발 서버가 `/api/*` 요청을 자동으로 포트 8000 백엔드로 프록시한다.
> 값을 설정하면 프록시를 우회해 CORS 오류가 발생할 수 있다.

### 2-4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속한다.

---

## 3. 관리자 페이지 접속

| 항목 | 값 |
|---|---|
| URL | http://localhost:3000/admin/login |
| 아이디 | `admin` (`.env`의 `ADMIN_USERNAME`) |
| 비밀번호 | `password123` (`.env`의 `ADMIN_PASSWORD`) |

> 운영 환경에서는 반드시 `.env`의 `ADMIN_PASSWORD`와 `ADMIN_JWT_SECRET`을 변경한다.

---

## 4. 전체 실행 순서 요약

```
1. 백엔드: venv 활성화 → pip install → .env 설정
2. 백엔드: python import_llm_data.py  (최초 1회)
3. 백엔드: uvicorn app.main:app --reload --port 8000
4. 프론트: npm install → .env 설정
5. 프론트: npm run dev
6. 브라우저: http://localhost:3000
```

---

## 5. 구현 완료 현황

### 일반 사용자 화면

| 화면 | 기능 | 상태 |
|---|---|---|
| 캠퍼스 선택 | 자연과학/인문사회 캠퍼스 선택 | ✅ |
| 지도+리스트 탐색 | KakaoMap 마커, 클러스터, 오버레이 | ✅ |
| 식당 목록 | 캠퍼스별 전체 조회, 스켈레톤 로딩 | ✅ |
| 필터 | 카테고리·가격대·분위기·주차·웨이팅 + URL 동기화 | ✅ |
| 필터 추천 | 추천 점수·추천 근거 기반 정렬 결과 | ✅ |
| 정렬 | 추천 점수순·이름순·가격순 | ✅ |
| 식당 상세 | AI 요약, 대표 메뉴, 분위기/주차/웨이팅 요약, 신뢰도 점수, 태그 | ✅ |
| 지도 실패 fallback | ListOnlyPage 이동 (`/campus/:slug/list`) | ✅ |
| 리스트 전용 탐색 | 지도 없는 리스트 화면 (동일 API 사용) | ✅ |
| 에러/빈 결과 처리 | ErrorMessage, EmptyState, 재시도 | ✅ |

### 관리자 화면

| 화면 | 기능 | 상태 |
|---|---|---|
| 로그인 | JWT 인증, 폼 유효성 검사 | ✅ |
| JWT 가드 | 미인증 시 로그인 페이지 리다이렉트 | ✅ |
| 대시보드 | 전체/분석완료/대기 식당 수 실데이터 | ✅ |
| 식당 관리 | 목록 조회, 추가/수정/삭제 모달 (CRUD) | ✅ |
| 리뷰 관리 | CSV 업로드, 업로드 결과 표시 | ✅ |
| 분석 관리 | 분석 잡 트리거, 진행률 폴링 (5초 간격) | ✅ |

---

## 6. 남은 구현 사항

### 백엔드

| 항목 | 내용 | 우선순위 |
|---|---|---|
| 신뢰도 점수 임포트 스크립트 | `review_credibility_restaurant_scores.csv`에서 `average_trust_score` DB 반영 | 높음 |
| `credibility_label` 필드 추가 | `restaurant_summaries` 테이블에 1~5 등급 필드 추가 및 API 응답 포함 | 중간 |
| `waiting` 필터 지원 | 추천 API에 `waiting` 쿼리 파라미터 처리 로직 추가 | 중간 |
| 대시보드 stats API | `GET /api/admin/dashboard/stats` — 리뷰 수 집계 | 중간 |
| LLM 실제 분석 연동 | 분석 잡에서 실제 모델 추론 + `restaurant_summaries` 갱신 | 낮음 |
| SQLite → PostgreSQL 전환 | 운영 환경 전환 시 필요 | 낮음 |

### 프론트엔드

| 항목 | 내용 | 우선순위 |
|---|---|---|
| `credibility_label` 등급 표시 | 상세 페이지에 1~5 등급을 "리뷰 신뢰도 높음" 등 텍스트로 표시 | 백엔드 연동 후 |
| `waiting` 필터 결과 반영 | 백엔드 지원 후 자동 동작 | 백엔드 연동 후 |
| 대시보드 리뷰 수 표시 | "—" → 실수치 (백엔드 stats API 구현 후) | 백엔드 연동 후 |
| RestaurantDetailPage MOCK 제거 | 백엔드 안정화 후 `placeholderData: MOCK` 제거 | 낮음 |

### LLM/Data 팀 전달 파일 처리

| 파일 | 처리 방법 | 상태 |
|---|---|---|
| `review_credibility_restaurant_scores.csv` | `data/` 폴더 복사 후 임포트 스크립트 실행 | ⏳ 백엔드 스크립트 작성 필요 |
| `review_credibility_review_level_scores.csv` | 추후 `reviews` 테이블 확장 시 활용 (즉시 적재 불필요) | — |
| `리뷰스코어링명세.docx` | 개발팀 참고 문서 | 📄 |

---

## 7. 주요 환경변수 참고

### 백엔드 (`.env`)

| 변수 | 설명 | 기본값 |
|---|---|---|
| `ADMIN_USERNAME` | 관리자 아이디 | `admin` |
| `ADMIN_PASSWORD` | 관리자 비밀번호 | `password123` |
| `ADMIN_JWT_SECRET` | JWT 서명 키 | `dev-secret-change-me` |
| `DATABASE_URL` | DB 연결 문자열 (미설정 시 SQLite) | SQLite |

### 프론트엔드 (`.env`)

| 변수 | 설명 | 값 |
|---|---|---|
| `VITE_KAKAO_MAP_KEY` | 카카오맵 JavaScript 앱 키 | 발급 필요 |
| `VITE_API_BASE_URL` | 백엔드 URL (개발 시 비워둠) | 빈값 권장 |
