import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@config/apiConfig';
import type {
  Campus,
  RestaurantListItem,
  RestaurantDetail,
  RestaurantFilter,
  Tag,
  PriceRange,
} from '@/types';

// ────────────────────────────────────────────────────────────────
// 백엔드 응답 원본 타입 (변환 전)
// ────────────────────────────────────────────────────────────────

interface BackendTag {
  type: string;
  value: string;
  confidenceScore: number;
}

interface BackendRestaurant {
  id: number;
  campusId: number;
  name: string;
  category: string | null;
  lat: number;
  lng: number;
  address: string | null;
  priceRange: string | null;          // '저렴함' | '보통' | '비쌈'
  phone: string | null;
  sourceUrl: string | null;
  summary: string | null;             // summary_text
  representativeMenu: string | null;
  moodSummary: string | null;
  parkingSummary: string | null;
  waitingSummary: string | null;
  averageTrustScore: number | null;   // 0~100
  tags: BackendTag[];
  recommendationScore: number | null;
  recommendationReasons: string[];
  hasAnalysis: boolean;
}

interface BackendCampusRestaurantsResponse {
  campus: {
    id: number;
    slug: string;
    name: string;
    lat: number;
    lng: number;
    radiusM: number;
  };
  restaurants: BackendRestaurant[];
}

interface BackendCampus {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  // slug: 백엔드 CampusResponse 스키마에 누락 — 백엔드팀 추가 요청 필요
}

// ────────────────────────────────────────────────────────────────
// 변환 유틸
// ────────────────────────────────────────────────────────────────

/** 한국어 가격 → PriceRange enum + 표시 레이블 */
function mapPrice(raw: string | null): { priceRange: PriceRange; priceLabel: string } {
  switch (raw) {
    case '저렴함': return { priceRange: 'cheap',     priceLabel: '저렴함' };
    case '비쌈':   return { priceRange: 'expensive', priceLabel: '비쌈'   };
    default:       return { priceRange: 'normal',    priceLabel: '보통'   };
  }
}

/** PriceRange enum → 백엔드 price_level 파라미터 (한국어) */
function priceRangeToBackend(pr?: PriceRange | ''): string | undefined {
  switch (pr) {
    case 'cheap':     return '저렴함';
    case 'expensive': return '비쌈';
    case 'normal':    return '보통';
    default:          return undefined;
  }
}

/**
 * 카테고리 한국어 → categoryCode (목록 표시·내부 구분용)
 * FilterPanel CATEGORIES와 반드시 동기화.
 */
function mapCategoryCode(category: string | null): string {
  const map: Record<string, string> = {
    '한식': 'korean', '중식': 'chinese', '일식': 'japanese',
    '양식': 'western', '분식': 'snack',  '카페': 'cafe',
    '치킨': 'chicken', '피자': 'pizza',  '고기': 'meat',
  };
  return category ? (map[category] ?? 'etc') : 'etc';
}

/**
 * categoryCode → 한국어 (백엔드 filter 파라미터 변환용)
 * FilterPanel CATEGORIES의 code와 반드시 동기화.
 */
const CATEGORY_CODE_TO_KR: Record<string, string> = {
  korean: '한식', chinese: '중식', japanese: '일식',
  western: '양식', snack: '분식', cafe: '카페',
  chicken: '치킨', pizza: '피자', meat: '고기',
};

/** tag type → 색상 */
const TAG_COLOR: Record<string, string> = {
  mood:    '#8b5cf6',
  food:    '#10b981',
  parking: '#f59e0b',
  feature: '#3b82f6',
};

/** 백엔드 태그 배열 → 프론트 Tag[] */
function mapTags(backendTags: BackendTag[]): Tag[] {
  return backendTags.map((t, i) => ({
    id:    i + 1,
    name:  t.value,
    color: TAG_COLOR[t.type] ?? '#6b7280',
  }));
}

/** 주차 태그 존재 여부 */
function hasParking(tags: BackendTag[]): boolean {
  return tags.some(t => t.value === '주차가능' || t.value === 'parking_available');
}

/** 백엔드 식당 객체 → RestaurantListItem */
function toListItem(r: BackendRestaurant): RestaurantListItem {
  const { priceRange, priceLabel } = mapPrice(r.priceRange);
  return {
    id:                    r.id,
    campusId:              r.campusId,
    name:                  r.name,
    category:              r.category ?? '',
    categoryCode:          mapCategoryCode(r.category),
    address:               r.address ?? '',
    lat:                   r.lat,
    lng:                   r.lng,
    priceRange,
    priceLabel,
    thumbnailUrl:          undefined,
    tags:                  mapTags(r.tags),
    summary:               r.summary ?? undefined,
    recommendationScore:   r.recommendationScore ?? undefined,
    recommendationReasons: r.recommendationReasons,
    hasAnalysis:           r.hasAnalysis,
    parking:               hasParking(r.tags),
    waiting:               undefined,
  };
}

/** 백엔드 식당 객체 → RestaurantDetail */
function toDetail(r: BackendRestaurant): RestaurantDetail {
  const base = toListItem(r);
  return {
    ...base,
    phone:       r.phone ?? undefined,
    openingHours: undefined,   // 백엔드 미지원
    closedDays:   undefined,   // 백엔드 미지원
    imageUrls:    [],
    reviewPoints: undefined,   // 백엔드 미지원 (별도 분석 결과)
    // averageTrustScore가 있을 때만 metadata 구성 (허수 값 제거)
    analysisMetadata: r.averageTrustScore != null
      ? {
          analyzedAt:      '',
          reviewCount:     0,
          reliabilityRate: r.averageTrustScore / 100,
        }
      : undefined,
  };
}

/** 추천 점수 기준 내림차순 정렬 (백엔드 sort 버그 우회) */
function sortByScore(list: RestaurantListItem[]): RestaurantListItem[] {
  return [...list].sort(
    (a, b) => (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0),
  );
}

// ────────────────────────────────────────────────────────────────
// 캠퍼스
// ────────────────────────────────────────────────────────────────

export async function fetchCampuses(): Promise<Campus[]> {
  const { data } = await apiClient.get<BackendCampus[]>(API_ENDPOINTS.campuses);
  return data.map(c => ({
    id:   c.id,
    slug: '',   // 백엔드 CampusResponse에 slug 필드 추가 필요
    name: c.name,
    lat:  c.latitude,
    lng:  c.longitude,
  }));
}

// ────────────────────────────────────────────────────────────────
// 식당 목록 — 캠퍼스 slug 기반 전체 조회
// GET /api/campuses/{slug}/restaurants
// ────────────────────────────────────────────────────────────────

export async function fetchRestaurantsByCampus(
  slug: string,
): Promise<RestaurantListItem[]> {
  const { data } = await apiClient.get<BackendCampusRestaurantsResponse>(
    API_ENDPOINTS.restaurantsByCampus(slug),
  );
  return data.restaurants.map(toListItem);
}

// ────────────────────────────────────────────────────────────────
// 식당 추천 — 필터 기반
// GET /api/campuses/{slug}/recommendations
//
// 주의: 백엔드 sort 로직에 KeyError 버그 있음 (recommendation_score vs
//       recommendationScore). 응답을 받은 뒤 프론트에서 재정렬.
// ────────────────────────────────────────────────────────────────

export async function fetchRecommendations(
  slug: string,
  filter: RestaurantFilter,
): Promise<RestaurantListItem[]> {
  const params: Record<string, unknown> = {};

  // categoryCode → 한국어 변환 (백엔드가 한국어로 비교)
  if (filter.category) {
    params['category'] = CATEGORY_CODE_TO_KR[filter.category] ?? filter.category;
  }
  if (filter.priceRange) {
    params['price_level'] = priceRangeToBackend(filter.priceRange);
  }
  if (filter.parking) {
    params['parking'] = true;
  }
  // waiting / sort / page / size: 백엔드 미지원 (추후 추가 예정)

  const { data } = await apiClient.get<BackendCampusRestaurantsResponse>(
    API_ENDPOINTS.recommendationsByCampus(slug),
    { params },
  );

  // 백엔드 sort 버그 우회 — 프론트에서 recommendationScore 기준 정렬
  return sortByScore(data.restaurants.map(toListItem));
}

// ────────────────────────────────────────────────────────────────
// 식당 상세
// GET /api/restaurants/{id}
// ────────────────────────────────────────────────────────────────

export async function fetchRestaurantById(
  id: number | string,
): Promise<RestaurantDetail> {
  const { data } = await apiClient.get<BackendRestaurant>(
    API_ENDPOINTS.restaurantById(id),
  );
  return toDetail(data);
}
