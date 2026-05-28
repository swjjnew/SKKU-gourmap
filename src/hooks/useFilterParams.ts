import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { PriceRange, RestaurantFilter } from '@/types';

export type SortOption = 'score' | 'name' | 'price';

export interface FilterParams {
  category: string;
  priceRange: PriceRange | '';
  parking: boolean;
  waiting: boolean;
  sort: SortOption;
}

const DEFAULT_FILTER: FilterParams = {
  category: '',
  priceRange: '',
  parking: false,
  waiting: false,
  sort: 'score',
};

function parseBool(value: string | null): boolean {
  return value === 'true';
}

/**
 * URL 쿼리 파라미터를 필터 상태로 읽고 쓰는 훅.
 * campusId 의존 제거 — slug는 URL 경로에서 직접 사용.
 */
export function useFilterParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filter: FilterParams = {
    category:   searchParams.get('category')   ?? DEFAULT_FILTER.category,
    priceRange: (searchParams.get('priceRange') as PriceRange | '') ?? DEFAULT_FILTER.priceRange,
    parking:    parseBool(searchParams.get('parking')),
    waiting:    parseBool(searchParams.get('waiting')),
    sort:       (searchParams.get('sort') as SortOption) ?? DEFAULT_FILTER.sort,
  };

  const setFilter = useCallback(
    (patch: Partial<FilterParams>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const merged = { ...filter, ...patch };

          if (!merged.category)   next.delete('category');   else next.set('category', merged.category);
          if (!merged.priceRange) next.delete('priceRange'); else next.set('priceRange', merged.priceRange);
          if (!merged.parking)    next.delete('parking');    else next.set('parking', 'true');
          if (!merged.waiting)    next.delete('waiting');    else next.set('waiting', 'true');
          if (merged.sort === DEFAULT_FILTER.sort) next.delete('sort'); else next.set('sort', merged.sort);

          return next;
        },
        { replace: true },
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, setSearchParams],
  );

  const resetFilter = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        ['category', 'priceRange', 'parking', 'waiting', 'sort'].forEach(k => next.delete(k));
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const hasFilter =
    filter.category   !== DEFAULT_FILTER.category   ||
    filter.priceRange !== DEFAULT_FILTER.priceRange  ||
    filter.parking    !== DEFAULT_FILTER.parking     ||
    filter.waiting    !== DEFAULT_FILTER.waiting;

  /** restaurantService.fetchRecommendations 에 넘길 형태로 변환 */
  const toRestaurantFilter = (): RestaurantFilter => ({
    category:   filter.category   || undefined,
    priceRange: filter.priceRange || undefined,
    parking:    filter.parking    || undefined,
    waiting:    filter.waiting    || undefined,
    sort:       filter.sort,
  });

  return { filter, setFilter, resetFilter, hasFilter, toRestaurantFilter };
}
