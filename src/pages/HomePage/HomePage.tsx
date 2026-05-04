import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KakaoMap from '@components/map/KakaoMap';
import RestaurantList from '@components/restaurant/RestaurantList';
import Loading from '@components/common/Loading';
import ErrorMessage from '@components/common/ErrorMessage';
import { useRestaurants } from '@hooks/useRestaurants';
import type { Restaurant } from '@/types';
import styles from './HomePage.module.css';

/**
 * 메인 페이지.
 * 좌측: 맛집 리스트 / 우측: 카카오맵
 *
 * NOTE: 실제 디자인이 정해지면 레이아웃을 그대로 두거나
 *       모바일 대응(바텀시트 등)을 추가하면 됩니다.
 */
function HomePage() {
  const navigate = useNavigate();
  const { restaurants, loading, error, refetch } = useRestaurants();
  const [selectedId, setSelectedId] = useState<Restaurant['id'] | null>(null);

  const handleSelect = (r: Restaurant) => {
    setSelectedId(r.id);
  };

  const handleOpenDetail = (r: Restaurant) => {
    navigate(`/restaurants/${r.id}`);
  };

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <h2 className={styles.heading}>맛집 목록</h2>
        {loading && <Loading />}
        {error && <ErrorMessage message={error} onRetry={refetch} />}
        {!loading && !error && (
          <RestaurantList
            restaurants={restaurants}
            selectedId={selectedId}
            onItemClick={handleOpenDetail}
          />
        )}
      </aside>
      <section className={styles.mapArea}>
        <KakaoMap restaurants={restaurants} onMarkerClick={handleSelect} />
      </section>
    </div>
  );
}

export default HomePage;
