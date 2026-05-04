/**
 * 맛집 도메인 모델 타입 정의.
 * 백엔드 응답 스펙이 확정되면 이 곳을 동기화합니다.
 */

export type RestaurantId = number | string;

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Category {
  id: number;
  name: string;
  /** 표시용 색상(HEX). 마커 컬러링 등에 사용. */
  color?: string;
}

export interface Restaurant {
  id: RestaurantId;
  name: string;
  description?: string;
  address: string;
  /** 위도/경도 */
  location: LatLng;
  /** 평점 (0~5) */
  rating?: number;
  /** 가격대 (1~4 정도) 또는 백엔드 정의를 따름 */
  priceRange?: number;
  /** 카테고리 (한식, 중식 등). 다중 카테고리 가능성 고려해 배열. */
  categories?: Category[];
  /** 대표 이미지 URL */
  thumbnailUrl?: string;
  /** 추가 이미지들 */
  imageUrls?: string[];
  /** 영업시간 텍스트 */
  openingHours?: string;
  /** 전화번호 */
  phone?: string;
  /** 등록일 */
  createdAt?: string;
  /** 수정일 */
  updatedAt?: string;
}

/**
 * 지도 영역(bounds) 기반 조회 요청.
 */
export interface BoundsQuery {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

/**
 * 검색/필터 파라미터.
 */
export interface RestaurantSearchParams {
  keyword?: string;
  categoryId?: number;
  minRating?: number;
  page?: number;
  size?: number;
}
