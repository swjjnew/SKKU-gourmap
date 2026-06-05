/**
 * API 설정.
 * 백엔드: FastAPI (uvicorn, localhost:8000)
 * Vite dev proxy: /api/* → http://localhost:8000
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '';

export const API_TIMEOUT_MS = 10_000;

export const API_ENDPOINTS = {
  // 캠퍼스 목록
  // GET /api/campuses/ → [{id, name, latitude, longitude, radius_m}]
  campuses: '/campuses/',

  // 캠퍼스별 식당 전체 조회 (slug 기반)
  // GET /api/campuses/{slug}/restaurants → {campus:{}, restaurants:[]}
  restaurantsByCampus: (slug: string) => `/campuses/${slug}/restaurants`,

  // 캠퍼스별 필터 추천 (slug 기반)
  // GET /api/campuses/{slug}/recommendations?category=&price_level=&mood=&parking=
  recommendationsByCampus: (slug: string) => `/campuses/${slug}/recommendations`,

  // 식당 상세
  // GET /api/restaurants/{id}
  restaurantById: (id: number | string) => `/restaurants/${id}`,

  // ── 관리자 (admin.py 구현 후 활성화) ────────────────────────────
  adminLogin: '/admin/auth/login',
  adminRestaurants: '/admin/restaurants',
  adminRestaurantById: (id: number | string) => `/admin/restaurants/${id}`,
  adminReviewsUpload: '/admin/reviews/upload',
  adminAnalysisJobs: '/admin/analysis-jobs',
  adminAnalysisJobById: (jobId: string) => `/admin/analysis-jobs/${jobId}`,
} as const;
