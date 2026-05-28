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
 * 캠퍼스별 지도 중심 좌표 및 기본 줌 레벨.
 * slug 는 React Router 의 /campus/:slug 와 동일하게 맞춥니다.
 */
export const CAMPUS_CENTERS = {
  natural: {
    lat: 37.296364404283516,
    lng: 126.9708791573265,
    level: 2,
    label: '자연과학캠퍼스',
  },
  humanities: {
    lat: 37.58761640986565,
    lng: 126.99372749860636,
    level: 2,
    label: '인문사회캠퍼스',
  },
} as const;

export type CampusSlug = keyof typeof CAMPUS_CENTERS;

/** slug 가 유효하지 않을 때 사용하는 fallback */
export const DEFAULT_CAMPUS: CampusSlug = 'natural';

/** 하위 호환용 — KakaoMap 등 기존 코드가 참조하는 기본 중심 좌표 */
export const DEFAULT_MAP_CENTER = {
  lat: CAMPUS_CENTERS[DEFAULT_CAMPUS].lat,
  lng: CAMPUS_CENTERS[DEFAULT_CAMPUS].lng,
} as const;

/**
 * 지도 초기 줌 레벨 (카카오맵 기준 1~14, 숫자가 작을수록 확대).
 */
export const DEFAULT_MAP_LEVEL = 2;

/**
 * 마커 클러스터링 활성화 임계 줌 레벨.
 */
export const CLUSTER_ENABLE_LEVEL = 6;
