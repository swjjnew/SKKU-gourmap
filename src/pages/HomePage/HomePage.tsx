// FR-02~07: 캠퍼스별 메인 화면 (지도 + 리스트)
import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import KakaoMap from '@components/map/KakaoMap';
import { CAMPUS_CENTERS, DEFAULT_CAMPUS, type CampusSlug } from '@config/mapConfig';
import type { Restaurant } from '@/types';
import styles from './HomePage.module.css';

/** 더미 식당 데이터 (API 연결 전 임시) */
const DUMMY_RESTAURANTS = [
  { id: 1, name: '수원 맛집 A', category: '한식', priceRange: '보통', score: 4.2 },
  { id: 2, name: '수원 맛집 B', category: '중식', priceRange: '저렴함', score: 3.8 },
  { id: 3, name: '수원 맛집 C', category: '일식', priceRange: '비쌈', score: 4.7 },
  { id: 4, name: '수원 맛집 D', category: '양식', priceRange: '보통', score: 4.0 },
];

/**
 * HomePage
 * /campus/:slug — 좌측 필터+리스트, 우측 카카오맵 (FR-02~07)
 */
function HomePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // slug 가 유효하지 않으면 natural 로 fallback
  const campusKey = (slug && slug in CAMPUS_CENTERS ? slug : DEFAULT_CAMPUS) as CampusSlug;
  const campus = CAMPUS_CENTERS[campusKey];

  const handleMarkerClick = (restaurant: Restaurant) => {
    navigate(`/restaurants/${restaurant.id}`);
  };

  return (
    <div className={styles.page}>
      {/* 상단 헤더 바 */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>← 캠퍼스 선택</button>
        <span className={styles.campusTitle}>{campus.label} 맛집 지도</span>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'map' ? styles.active : ''}`}
            onClick={() => setViewMode('map')}
          >지도</button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >리스트</button>
          <Link className={styles.listOnlyLink} to={`/campus/${slug}/list`}>
            리스트 전용 →
          </Link>
        </div>
      </header>

      <div className={styles.body}>
        {/* 사이드바: 필터 + 식당 목록 */}
        <aside className={styles.sidebar}>
          {/* 필터 패널 플레이스홀더 (FR-06) */}
          <div className={styles.section}>
            <div className={styles.sectionBadge}>FR-06</div>
            <div className={styles.filterPlaceholder}>
              <strong>필터 패널 영역</strong>
              <p>음식 종류 / 가격대 / 분위기 / 주차 / 웨이팅<br />URL 쿼리 파라미터와 동기화</p>
              <div className={styles.filterChips}>
                {['음식 종류', '가격대', '분위기', '주차', '웨이팅'].map(f => (
                  <span key={f} className={styles.chip}>{f}</span>
                ))}
              </div>
            </div>
          </div>

          {/* 식당 리스트 (FR-02~04, FR-07~08) */}
          <div className={styles.section}>
            <div className={styles.sectionBadge}>FR-02~04 · FR-07~08</div>
            <strong className={styles.sectionTitle}>식당 목록 (추천 점수 정렬)</strong>
            <ul className={styles.restaurantList}>
              {DUMMY_RESTAURANTS.map(r => (
                <li
                  key={r.id}
                  className={styles.restaurantItem}
                  onClick={() => navigate(`/restaurants/${r.id}`)}
                >
                  <div className={styles.rName}>{r.name}</div>
                  <div className={styles.rMeta}>
                    <span className={styles.rCategory}>{r.category}</span>
                    <span className={styles.rPrice}>{r.priceRange}</span>
                    <span className={styles.rScore}>★ {r.score}</span>
                  </div>
                  <div className={styles.rReason}>
                    <span className={styles.reasonChip}>추천 근거 칩 (FR-08)</span>
                    <span className={styles.reasonChip}>AI 요약</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* 카카오맵 */}
        <section className={styles.mapArea}>
          <KakaoMap
            center={{ lat: campus.lat, lng: campus.lng }}
            level={campus.level}
            restaurants={[]}
            onMarkerClick={handleMarkerClick}
          />
        </section>
      </div>
    </div>
  );
}

export default HomePage;
