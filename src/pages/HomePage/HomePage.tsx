import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import KakaoMap, { type MapBounds } from '@components/map/KakaoMap';
import RestaurantCard from '@components/restaurant/RestaurantCard';
import { FilterPanel } from '@components/filter/FilterPanel';
import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { EmptyState } from '@components/common/EmptyState';
import { RestaurantListSkeleton } from '@components/common/Skeleton';
import ErrorMessage from '@components/common/ErrorMessage';
import { TagBadge } from '@components/common/TagBadge';
import { ReasonChips } from '@components/common/ReasonChips';
import { CAMPUS_CENTERS, DEFAULT_CAMPUS, type CampusSlug } from '@config/mapConfig';
import { fetchRestaurantsByCampus, fetchRecommendations, fetchRestaurantById } from '@services/restaurantService';
import { useFilterParams } from '@hooks/useFilterParams';
import type { RestaurantListItem } from '@/types';
import styles from './HomePage.module.css';

function HomePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null); // 사이드바 상세 표시용

  const isValidSlug = slug != null && slug in CAMPUS_CENTERS;

  useEffect(() => {
    if (!isValidSlug) {
      navigate('/', { replace: true, state: { errorMessage: `'${slug}'는 유효하지 않은 캠퍼스입니다. 올바른 캠퍼스를 선택해주세요.` } });
    }
  }, [isValidSlug, navigate, slug]);

  const campusKey = (isValidSlug ? slug : DEFAULT_CAMPUS) as CampusSlug;
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

  // 사이드바 상세 정보 쿼리
  const detailQuery = useQuery({
    queryKey: ['restaurant', detailId],
    queryFn: () => fetchRestaurantById(detailId!),
    enabled: detailId != null,
    staleTime: 60_000,
  });

  const activeQuery = hasFilter ? filteredQuery : baseQuery;
  const restaurants: RestaurantListItem[] = activeQuery.data ?? [];
  const { isLoading, isError, error: queryError } = activeQuery;

  // 지도에 표시할 마커: 상세 보기 중이면 선택된 식당만
  const mapRestaurants = detailId != null
    ? restaurants.filter(r => r.id === detailId)
    : restaurants;

  // ── 이벤트 핸들러 ──────────────────────────────────────────────
  const handleMarkerClick = useCallback((r: RestaurantListItem) => {
    setSelectedId(r.id);
    setDetailId(r.id);
  }, []);

  const handleCardClick = useCallback((r: RestaurantListItem) => {
    if (viewMode === 'map') {
      setSelectedId(r.id);
      setDetailId(r.id);
    } else {
      navigate(`/restaurants/${r.id}`, { state: { from: `/campus/${campusKey}` } });
    }
  }, [viewMode, navigate, campusKey]);

  const handleBoundsChange = useCallback((_bounds: MapBounds) => {}, []);

  const handleMapLoadError = useCallback(() => {
    setViewMode('list');
  }, []);

  const handleCloseDetail = () => {
    setDetailId(null);
    setSelectedId(null);
  };

  // ── 사이드바 상세 패널 ─────────────────────────────────────────
  const detail = detailQuery.data;
  const detailPanel = (
    <div className={styles.detailPanel}>
      <button className={styles.detailBackBtn} onClick={handleCloseDetail}>
        ← 목록으로
      </button>
      {detailQuery.isLoading && <p className={styles.detailLoading}>불러오는 중…</p>}
      {detail && (
        <>
          <h2 className={styles.detailName}>{detail.name}</h2>
          <div className={styles.detailMeta}>
            {detail.category && <span>{detail.category}</span>}
            {detail.priceLabel && <><span className={styles.dot}>·</span><span>💰 {detail.priceLabel}</span></>}
          </div>
          {detail.address && <p className={styles.detailAddr}>📍 {detail.address}</p>}
          {detail.phone && <p className={styles.detailAddr}>📞 {detail.phone}</p>}

          {detail.tags.length > 0 && (
            <div className={styles.detailTags}>
              {detail.tags.map(t => <TagBadge key={t.id} tag={t} size="sm" />)}
            </div>
          )}

          {detail.summary && (
            <div className={styles.detailSection}>
              <strong className={styles.detailSectionTitle}>AI 리뷰 요약</strong>
              <p className={styles.detailSummary}>{detail.summary}</p>
              {detail.averageTrustScore != null && (
                <p className={styles.detailTrust}>리뷰 신뢰도 <span className={styles.detailTrustScore}>{detail.averageTrustScore.toFixed(1)}</span> / 100</p>
              )}
              {detail.credibilityLabel != null && (() => {
                const labelMap: Record<number, string> = { 1: '낮음', 2: '다소 낮음', 3: '보통', 4: '다소 높음', 5: '높음' };
                const label = labelMap[detail.credibilityLabel] ?? '알 수 없음';
                return (
                  <div className={styles.credibilityComment}>
                    <p>AI 리뷰 신뢰도가 <strong>"{label}"</strong>인 식당이에요.</p>
                    <p>신뢰 점수는 음식 맛의 질이나 식당 상태를 반영하지 않아요.</p>
                    <p>신뢰 점수는 리뷰의 솔직함만을 반영해요.</p>
                    <p>리뷰 신뢰도의 높고 낮음은 상대적 평가이며, 상권 단위로 평가됩니다.</p>
                  </div>
                );
              })()}
            </div>
          )}

          {detail.representativeMenu && (
            <div className={styles.detailSection}>
              <strong className={styles.detailSectionTitle}>대표 메뉴</strong>
              <div className={styles.menuChips}>
                {detail.representativeMenu.split('|').map(m => (
                  <span key={m} className={styles.menuChip}>{m.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {(detail.moodSummary || detail.parkingSummary || detail.waitingSummary) && (
            <div className={styles.detailSection}>
              <strong className={styles.detailSectionTitle}>상세 정보</strong>
              <ul className={styles.detailInfoList}>
                {detail.moodSummary    && <li><span className={styles.detailLabel}>분위기</span>{detail.moodSummary}</li>}
                {detail.parkingSummary && <li><span className={styles.detailLabel}>주차</span>{detail.parkingSummary}</li>}
                {detail.waitingSummary && <li><span className={styles.detailLabel}>웨이팅</span>{detail.waitingSummary}</li>}
              </ul>
            </div>
          )}

          {detail.recommendationReasons && detail.recommendationReasons.length > 0 && (
            <div className={styles.detailSection}>
              <strong className={styles.detailSectionTitle}>추천 근거</strong>
              <ReasonChips reasons={detail.recommendationReasons} max={6} />
            </div>
          )}

          <button
            className={styles.detailFullBtn}
            onClick={() => navigate(`/restaurants/${detail.id}`, { state: { from: `/campus/${campusKey}` } })}
          >
            상세 페이지 전체 보기 →
          </button>
        </>
      )}
    </div>
  );

  // ── 필터 + 리스트 블록 ─────────────────────────────────────────
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
            message={queryError instanceof Error ? queryError.message : '식당 목록을 불러올 수 없습니다.'}
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
            onClick={() => { setViewMode('map'); handleCloseDetail(); }}
          >
            지도
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => { setViewMode('list'); handleCloseDetail(); }}
          >
            리스트
          </button>
        </div>
      </header>

      {viewMode === 'map' && (
        <div className={styles.body}>
          <aside className={`${styles.sidebar} ${detailId != null ? styles.sidebarWide : ''}`}>
            {detailId != null ? detailPanel : listContent}
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
                restaurants={mapRestaurants}
                selectedId={selectedId}
                onMarkerClick={handleMarkerClick}
                onBoundsChange={handleBoundsChange}
                onLoadError={handleMapLoadError}
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
