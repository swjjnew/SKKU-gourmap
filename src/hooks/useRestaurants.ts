import { useQuery } from '@tanstack/react-query';
import { fetchRestaurantsByCampus, fetchRecommendations } from '@services/restaurantService';
import type { RestaurantListItem, RestaurantFilter } from '@/types';

/**
 * 캠퍼스 slug로 식당 전체 목록을 가져오는 훅.
 * 백엔드: GET /api/campuses/{slug}/restaurants
 */
export function useRestaurantsByCampus(slug: string | undefined) {
  return useQuery({
    queryKey: ['restaurants', 'byCampus', slug],
    queryFn: () => fetchRestaurantsByCampus(slug!),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

/**
 * 필터 기반 추천 식당 목록 훅.
 * 백엔드: GET /api/campuses/{slug}/recommendations
 */
export function useRecommendations(slug: string | undefined, filter: RestaurantFilter) {
  return useQuery({
    queryKey: ['restaurants', 'recommendations', slug, filter],
    queryFn: () => fetchRecommendations(slug!, filter),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export type { RestaurantListItem };
