/**
 * 식당 도메인 타입 정의.
 * DB 스키마(소공개_DB.docx) 기준으로 작성.
 * 백엔드 응답 확정 시 이 파일과 services/ 를 동기화.
 */

// ────────────────────────────────────────────
// 공통
// ────────────────────────────────────────────

export interface LatLng {
  lat: number;
  lng: number;
}

// ────────────────────────────────────────────
// 캠퍼스 (campuses 테이블)
// ────────────────────────────────────────────

export interface Campus {
  id: number;
  slug: string;           // 'natural' | 'humanities'
  name: string;
  lat: number;
  lng: number;
}

// ────────────────────────────────────────────
// 태그 (restaurant_tags 테이블)
// ────────────────────────────────────────────

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

// ────────────────────────────────────────────
// 식당 목록 아이템
// GET /api/restaurants?campus_id=:id
// GET /api/restaurants/recommendations
// ────────────────────────────────────────────

export type PriceRange = 'cheap' | 'normal' | 'expensive';

export interface RestaurantListItem {
  id: number;
  campusId: number;
  name: string;
  category: string;       // 표시용: '한식', '중식'
  categoryCode: string;   // 필터용: 'korean', 'chinese'
  address: string;
  lat: number;
  lng: number;
  priceRange: PriceRange;
  priceLabel: string;     // '저렴함' | '보통' | '비쌈'
  thumbnailUrl?: string;
  tags: Tag[];

  // restaurant_summaries 합류
  summary?: string;
  recommendationScore?: number;        // 0~100, 백엔드 계산
  recommendationReasons?: string[];    // 추천 근거 문장 (최대 5개)
  hasAnalysis: boolean;

  parking?: boolean;
  waiting?: boolean;
}

// ────────────────────────────────────────────
// 식당 상세
// GET /api/restaurants/:id
// ────────────────────────────────────────────

export interface ReviewPoint {
  label: string;
  score: number;          // 0~5
  description: string;
}

export interface AnalysisMetadata {
  analyzedAt: string;
  reviewCount: number;
  reliabilityRate: number; // 0~1
}

export interface RestaurantDetail {
  id: number;
  campusId: number;
  name: string;
  category: string;
  categoryCode: string;
  address: string;
  lat: number;
  lng: number;
  priceRange: PriceRange;
  priceLabel: string;
  phone?: string;
  openingHours?: string;
  closedDays?: string;
  thumbnailUrl?: string;
  imageUrls?: string[];
  tags: Tag[];
  parking?: boolean;
  waiting?: boolean;

  hasAnalysis: boolean;
  summary?: string;
  recommendationScore?: number;
  recommendationReasons?: string[];
  reviewPoints?: ReviewPoint[];
  analysisMetadata?: AnalysisMetadata;

  createdAt?: string;
  updatedAt?: string;
}

// ────────────────────────────────────────────
// 필터 파라미터
// ────────────────────────────────────────────

export interface RestaurantFilter {
  campusId?: number;
  category?: string;
  priceRange?: PriceRange;
  mood?: string;
  parking?: boolean;
  waiting?: boolean;
  sort?: 'score' | 'name' | 'price';
  page?: number;
  size?: number;
}

// ────────────────────────────────────────────
// 하위 호환 타입 (KakaoMap 등 기존 코드 대응)
// 점진적으로 RestaurantListItem / RestaurantDetail 로 교체 예정
// ────────────────────────────────────────────

export type RestaurantId = number | string;

export interface Category {
  id: number;
  name: string;
  color?: string;
}

/** @deprecated RestaurantListItem 또는 RestaurantDetail 을 사용하세요 */
export interface Restaurant {
  id: RestaurantId;
  name: string;
  description?: string;
  address: string;
  location: LatLng;
  rating?: number;
  priceRange?: number;
  categories?: Category[];
  thumbnailUrl?: string;
  imageUrls?: string[];
  openingHours?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoundsQuery {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

export interface RestaurantSearchParams {
  keyword?: string;
  categoryId?: number;
  minRating?: number;
  page?: number;
  size?: number;
}

// ────────────────────────────────────────────
// 관리자 (analysis_jobs 테이블)
// ────────────────────────────────────────────

export type AnalysisJobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AnalysisJob {
  jobId: string;
  restaurantId: number;
  restaurantName: string;
  status: AnalysisJobStatus;
  progress: number;
  createdAt: string;
  completedAt?: string;
}
