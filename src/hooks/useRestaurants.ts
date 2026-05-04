import { useEffect, useState } from 'react';
import { fetchRestaurants } from '@services/restaurantService';
import type { Restaurant, RestaurantSearchParams } from '@/types';

interface UseRestaurantsResult {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * 맛집 목록을 가져오는 훅.
 * 페이지/필터/정렬을 관리하는 더 복잡한 버전은 추후 별도 훅으로 분리.
 */
export function useRestaurants(
  params?: RestaurantSearchParams,
): UseRestaurantsResult {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchRestaurants(params)
      .then((page) => {
        if (cancelled) return;
        setRestaurants(page.content);
      })
      .catch((err: { message?: string }) => {
        if (cancelled) return;
        setError(err?.message ?? '맛집 목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params), reloadKey]);

  return {
    restaurants,
    loading,
    error,
    refetch: () => setReloadKey((k) => k + 1),
  };
}
