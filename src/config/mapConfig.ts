export const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY || '';

export const KAKAO_MAP_SDK_URL = (appkey: string) =>
  `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false&libraries=services,clusterer`;

export const CAMPUS_CENTERS = {
  natural: {
    lat: 37.29661451042914,
    lng: 126.971158202363,
    level: 1,
    label: '자연과학캠퍼스',
  },
  humanities: {
    lat: 37.58491356311817,
    lng: 126.99714124668398,
    level: 1,
    label: '인문사회캠퍼스',
  },
} as const;

export type CampusSlug = keyof typeof CAMPUS_CENTERS;

export const DEFAULT_CAMPUS: CampusSlug = 'natural';

export const DEFAULT_MAP_CENTER = {
  lat: CAMPUS_CENTERS[DEFAULT_CAMPUS].lat,
  lng: CAMPUS_CENTERS[DEFAULT_CAMPUS].lng,
} as const;

export const DEFAULT_MAP_LEVEL = 2;

export const CLUSTER_ENABLE_LEVEL = 6;
