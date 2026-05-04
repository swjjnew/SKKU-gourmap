/**
 * API 관련 설정.
 * 모든 백엔드 호출은 이 베이스 URL 위에 붙습니다.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const API_TIMEOUT_MS = 10_000;

/**
 * 백엔드 API 엔드포인트 경로 모음.
 * 추후 백엔드 명세가 확정되면 이 곳을 한 번에 수정합니다.
 */
export const API_ENDPOINTS = {
  // 맛집
  restaurants: '/restaurants',
  restaurantById: (id: string | number) => `/restaurants/${id}`,
  restaurantsByBounds: '/restaurants/bounds',
  // 카테고리
  categories: '/categories',
  // 검색
  search: '/restaurants/search',
} as const;
