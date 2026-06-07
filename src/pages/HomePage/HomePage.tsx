// FR-02~07: 캠퍼스별 메인 화면 (지도 + 리스트)
import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import KakaoMap, { type MapBounds } from '@components/map/KakaoMap';
import RestaurantCard from '@components/restaurant/RestaurantCard';
import { FilterPanel } from '@components/filter/FilterPanel';
import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { EmptyState } from '@components/common/EmptyState';
import { RestaurantListSkeleton } from '@components/common/Skeleton';
import ErrorMessage from '@components/common/ErrorMessage';
import { CAMPUS_CENTERS, DEFAULT_CAMPUS, type CampusSlug } from '@config/mapConfig';
import { fetchRestaurantsByCampus, fetchRecommendations } from '@services/restaurantService';
import { useFilterParams } from '@hooks/useFilterParams';
import type { RestaurantListItem } from '@/types';
import styles from './HomePage.module.css';

function HomePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const campusKey = (slug && slug in CAMPUS_CENTERS ? slug : DEFAULT_CAMPUS) as CampusSlug;
  const campus = CAMPUS_CENTERS[campusKey];

  // 필터 상태 (URL 쿼리 파라미터)
  const { filter, setFilter, resetFilter, hasFilter, toRestaurantFilter } = useFilterParams();

  // ── 식당 목록: 필터 없으면 전체조회, 있으면 추천 API ────────────
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

  const activeQuery  = hasFilter ? filteredQuery : baseQuery;
  const restaurants: RestaurantListItem[] = activeQuery.data ?? [];
  const { isLoading, isError, error: queryError } = activeQuery;

  // ── 이벤트 핸들러 ──────────────────────────────────────────────
  const handleMarkerClick = useCallback((r: RestaurantListItem) => {
    setSelectedId(r.id);
    navigate(`/restaurants/${r.id}`, { state: { from: `/campus/${campusKey}` } });
  }, [navigate, campusKey]);

  const handleCardClick = useCallback((r: RestaurantListItem) => {
    setSelectedId(r.id);
    navigate(`/restaurants/${r.id}`, { state: { from: `/campus/${campusKey}` } });
  }, [navigate, campusKey]);

  const handleBoundsChange = useCallback((_bounds: MapBounds) => {
    // Phase 4에서 bounds 기반 추가 조회로 확장 예정
  }, []);

  // ── 필터 + 리스트 블록 (지도/리스트 모드 공용) ─────────────────
  const listContent = (
    <>
      <FilterPanel
        filter={filter}
        hasFilter={hasFilter}
        onChange={setFilter}
        onReset={resetFilter}
      />

      <div className={styles.listSection}>
        <strong className={styles.sectionTitle}>
          {hasFilter ? '추천 식당' : '식당 목록'}
          {!isLoading && restaurants.length > 0 && (
            <span className={styles.count}> {restaurants.length}개</span>
          )}
        </strong>

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

        <ul className={styles.restaurantList}>
          {restaurants.map((r) => (
            <li key={r.id}>
              <RestaurantCard
                restaurant={r}
                selected={r.id === selectedId}
                onClick={() => handleCardClick(r)}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ← 캠퍼스 선택
        </button>
        <span className={styles.campusTitle}>{campus.label} 맛집 지도</span>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'map' ? styles.active : ''}`}
            onClick={() => setViewMode('map')}
          >
            지도
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            리스트
          </button>
        </div>
      </header>

      {viewMode === 'map' && (
        <div className={styles.body}>
          <aside className={styles.sidebar}>
            {listContent}
          </aside>
          <section className={styles.mapArea}>
            <ErrorBoundary
              name="map"
              retryLabel="지도 다시 로드"
              fallback={
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                  <p style={{ color: '#6b7280', fontSize: 14 }}>🗺️ 지도를 불러올 수 없습니다.</p>
                  <button
                    style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}
                    onClick={() => navigate(`/campus/${campusKey}/list`)}
                  >
                    목록으로 보기
                  </button>
                </div>
              }
            >
              <KakaoMap
                center={{ lat: campus.lat, lng: campus.lng }}
                level={campus.level}
                restaurants={restaurants}
                selectedId={selectedId}
                onMarkerClick={handleMarkerClick}
                onBoundsChange={handleBoundsChange}
              />
            </ErrorBoundary>
          </section>
        </div>
      )}

      {viewMode === 'list' && (
        <div className={styles.listView}>
          {listContent}
        </div>
      )}
    </div>
  );
}

export default HomePage;