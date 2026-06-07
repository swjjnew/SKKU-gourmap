// NFR-R-04: 지도 장애 시 리스트 전용 fallback 화면
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import RestaurantCard from '@components/restaurant/RestaurantCard';
import { FilterPanel } from '@components/filter/FilterPanel';
import { EmptyState } from '@components/common/EmptyState';
import { RestaurantListSkeleton } from '@components/common/Skeleton';
import ErrorMessage from '@components/common/ErrorMessage';
import { fetchRestaurantsByCampus, fetchRecommendations } from '@services/restaurantService';
import { useFilterParams } from '@hooks/useFilterParams';
import { CAMPUS_CENTERS, DEFAULT_CAMPUS, type CampusSlug } from '@config/mapConfig';
import type { RestaurantListItem } from '@/types';
import styles from './ListOnlyPage.module.css';

function ListOnlyPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const campusKey = (slug && slug in CAMPUS_CENTERS ? slug : DEFAULT_CAMPUS) as CampusSlug;
  const campus = CAMPUS_CENTERS[campusKey];

  const { filter, setFilter, resetFilter, hasFilter, toRestaurantFilter } = useFilterParams();

  const baseQuery = useQuery({
    queryKey: ['restaurants', 'byCampus', campusKey, filter.sort],
    queryFn: () => fetchRestaurantsByCampus(campusKey, filter.sort),
    enabled: !hasFilter,
    staleTime: 60_000,
  });

  const filteredQuery = useQuery({
    queryKey: ['restaurants', 'recommendations', campusKey, toRestaurantFilter()],
    queryFn: () => fetchRecommendations(campusKey, toRestaurantFilter()),
    enabled: hasFilter,
    staleTime: 60_000,
  });

  const activeQuery = hasFilter ? filteredQuery : baseQuery;
  const restaurants: RestaurantListItem[] = activeQuery.data ?? [];
  const { isLoading, isError, error: queryError } = activeQuery;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(`/campus/${campusKey}`)}>
          ← 지도로 돌아가기
        </button>
        <span className={styles.title}>{campus.label} — 리스트 탐색</span>
        <span className={styles.badge}>지도 없이 탐색 중</span>
      </header>

      <div className={styles.notice}>
        🗺️ 지도를 불러올 수 없어 리스트 모드로 표시합니다.
      </div>

      <main className={styles.main}>
        <FilterPanel
          filter={filter}
          hasFilter={hasFilter}
          onChange={setFilter}
          onReset={resetFilter}
        />

        <div className={styles.listHeader}>
          <strong className={styles.listTitle}>
            {hasFilter ? '추천 식당' : '식당 목록'}
            {!isLoading && restaurants.length > 0 && (
              <span className={styles.count}> {restaurants.length}개</span>
            )}
          </strong>
        </div>

        {isLoading && <RestaurantListSkeleton count={4} />}

        {isError && (
          <ErrorMessage
            message={
              queryError instanceof Error
                ? queryError.message
                : '식당 목록을 불러올 수 없습니다.'
            }
          />
        )}

        {!isLoading && !isError && restaurants.length === 0 && (
          <EmptyState
            message="조건에 맞는 식당이 없습니다"
            description={hasFilter ? '필터를 바꿔보거나 초기화해 보세요.' : undefined}
            resetLabel={hasFilter ? '필터 초기화' : null}
            onReset={resetFilter}
          />
        )}

        <ul className={styles.list}>
          {restaurants.map(r => (
            <li key={r.id}>
              <RestaurantCard
                restaurant={r}
                selected={false}
                onClick={() => navigate(`/restaurants/${r.id}`, { state: { from: `/campus/${campusKey}/list` } })}
              />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default ListOnlyPage;
