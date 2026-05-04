/**
 * 카카오맵 관련 설정.
 */

export const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY || '';

/**
 * 카카오맵 SDK CDN URL.
 * services 라이브러리는 장소 검색/지오코딩에 필요합니다.
 */
export const KAKAO_MAP_SDK_URL = (appkey: string) =>
  `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services,clusterer`;

/**
 * 지도 초기 중심 좌표.
 * 기본값은 성균관대학교 자연과학캠퍼스(율전) - 추후 인문사회캠퍼스(명륜)와 분기 가능.
 */
export const DEFAULT_MAP_CENTER = {
  lat: 37.2939,
  lng: 126.9769,
} as const;

/**
 * 지도 초기 줌 레벨 (카카오맵 기준 1~14, 숫자가 작을수록 확대).
 */
export const DEFAULT_MAP_LEVEL = 4;

/**
 * 마커 클러스터링 활성화 임계 줌 레벨.
 */
export const CLUSTER_ENABLE_LEVEL = 6;
