import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@config/apiConfig';
import type {
  RestaurantListItem,
  RestaurantDetail,
  RestaurantFilter,
  Tag,
  PriceRange,
} from '@/types';

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
  priceRange: string | null;
  phone: string | null;
  sourceUrl: string | null;
  summary: string | null;
  representativeMenu: string | null;
  moodSummary: string | null;
  parkingSummary: string | null;
  waitingSummary: string | null;
  averageTrustScore: number | null;
  credibilityLabel: number | null;
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

function mapPrice(raw: string | null): { priceRange: PriceRange; priceLabel: string } {
  switch (raw) {
    case '저렴함': return { priceRange: 'cheap',     priceLabel: '저렴함' };
    case '비쌈':   return { priceRange: 'expensive', priceLabel: '비쌈'   };
    default:       return { priceRange: 'normal',    priceLabel: '보통'   };
  }
}

function priceRangeToBackend(pr?: PriceRange | ''): string | undefined {
  switch (pr) {
    case 'cheap':     return '저렴함';
    case 'expensive': return '비쌈';
    case 'normal':    return '보통';
    default:          return undefined;
  }
}

function mapCategoryCode(category: string | null): string {
  const map: Record<string, string> = {
    '한식': 'korean', '중식': 'chinese', '일식': 'japanese',
    '양식': 'western', '분식': 'snack',  '카페': 'cafe',
    '치킨': 'chicken', '피자': 'pizza',  '고기': 'meat',
  };
  return category ? (map[category] ?? 'etc') : 'etc';
}

const CATEGORY_CODE_TO_KR: Record<string, string> = {
  korean: '한식', chinese: '중식', japanese: '일식',
  western: '양식', snack: '분식', cafe: '카페',
  chicken: '치킨', pizza: '피자', meat: '고기',
};

const TAG_COLOR: Record<string, string> = {
  mood:    '#8b5cf6',
  food:    '#10b981',
  parking: '#f59e0b',
  feature: '#3b82f6',
};

function mapTags(backendTags: BackendTag[]): Tag[] {
  return backendTags.map((t, i) => ({
    id:    i + 1,
    name:  t.value,
    color: TAG_COLOR[t.type] ?? '#6b7280',
  }));
}

function hasParking(tags: BackendTag[]): boolean {
  return tags.some(t => t.value === '주차가능' || t.value === 'parking_available');
}

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

function toDetail(r: BackendRestaurant): RestaurantDetail {
  const base = toListItem(r);
  return {
    ...base,
    phone:              r.phone ?? undefined,
    openingHours:       undefined,
    closedDays:         undefined,
    imageUrls:          [],
    representativeMenu: r.representativeMenu ?? undefined,
    moodSummary:        r.moodSummary        ?? undefined,
    parkingSummary:     r.parkingSummary      ?? undefined,
    waitingSummary:     r.waitingSummary      ?? undefined,
    averageTrustScore:  r.averageTrustScore   ?? undefined,
    credibilityLabel:   r.credibilityLabel    ?? undefined,
    reviewPoints:       undefined,
    analysisMetadata:   r.averageTrustScore != null
      ? { analyzedAt: '', reviewCount: 0, reliabilityRate: r.averageTrustScore / 100 }
      : undefined,
  };
}

const PRICE_ORDER: Record<string, number> = { cheap: 0, normal: 1, expensive: 2 };

function applySort(list: RestaurantListItem[], sort?: string): RestaurantListItem[] {
  const arr = [...list];
  switch (sort) {
    case 'name':
      return arr.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    case 'price':
      return arr.sort(
        (a, b) => (PRICE_ORDER[a.priceRange] ?? 1) - (PRICE_ORDER[b.priceRange] ?? 1),
      );
    default:
      return arr.sort((a, b) => (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0));
  }
}

export async function fetchRestaurantsByCampus(
  slug: string,
  sort?: string,
): Promise<RestaurantListItem[]> {
  const { data } = await apiClient.get<BackendCampusRestaurantsResponse>(
    API_ENDPOINTS.restaurantsByCampus(slug),
  );
  return applySort(data.restaurants.map(toListItem), sort);
}

export async function fetchRecommendations(
  slug: string,
  filter: RestaurantFilter,
): Promise<RestaurantListItem[]> {
  const params: Record<string, unknown> = {};
  if (filter.category)   params['category']    = CATEGORY_CODE_TO_KR[filter.category] ?? filter.category;
  if (filter.priceRange) params['price_level'] = priceRangeToBackend(filter.priceRange);
  if (filter.mood)       params['mood']         = filter.mood;
  if (filter.parking)    params['parking']      = true;
  if (filter.waiting)    params['waiting']      = true;

  const { data } = await apiClient.get<BackendCampusRestaurantsResponse>(
    API_ENDPOINTS.recommendationsByCampus(slug),
    { params },
  );
  return applySort(data.restaurants.map(toListItem), filter.sort);
}

export async function fetchRestaurantById(
  id: number | string,
): Promise<RestaurantDetail> {
  const { data } = await apiClient.get<BackendRestaurant>(
    API_ENDPOINTS.restaurantById(id),
  );
  return toDetail(data);
}
