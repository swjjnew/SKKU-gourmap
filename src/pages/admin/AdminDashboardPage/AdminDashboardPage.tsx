import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchRestaurantsByCampus } from '@services/restaurantService';
import styles from './AdminDashboardPage.module.css';

function AdminDashboardPage() {
  const navigate = useNavigate();

  const naturalQ = useQuery({
    queryKey: ['admin', 'restaurants', 'natural'],
    queryFn: () => fetchRestaurantsByCampus('natural'),
    staleTime: 60_000,
  });
  const humanitiesQ = useQuery({
    queryKey: ['admin', 'restaurants', 'humanities'],
    queryFn: () => fetchRestaurantsByCampus('humanities'),
    staleTime: 60_000,
  });

  const allRestaurants = [
    ...(naturalQ.data ?? []),
    ...(humanitiesQ.data ?? []),
  ];
  const totalCount    = allRestaurants.length;
  const analyzedCount = allRestaurants.filter(r => r.hasAnalysis).length;
  const pendingCount  = totalCount - analyzedCount;
  const isLoading     = naturalQ.isLoading || humanitiesQ.isLoading;

  const stats = [
    { label: '전체 식당',  value: isLoading ? '…' : String(totalCount),    icon: '🍽️', color: '#eff6ff' },
    { label: '분석 완료',  value: isLoading ? '…' : String(analyzedCount),  icon: '✅', color: '#f0fdf4' },
    { label: '분석 대기',  value: isLoading ? '…' : String(pendingCount),   icon: '⏳', color: '#fef2f2' },
    { label: '전체 리뷰',  value: '—',  icon: '💬', color: '#fef3c7' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>대시보드</h1>
      </div>

      <div className={styles.statsGrid}>
        {stats.map(s => (
          <div key={s.label} className={styles.statCard} style={{ background: s.color }}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>빠른 이동</h2>
        <div className={styles.quickLinks}>
          {[
            { label: '식당 관리',  path: '/admin/restaurants', desc: '식당 추가·수정·삭제' },
            { label: '리뷰 관리',  path: '/admin/reviews',     desc: 'CSV 업로드 및 리뷰 확인' },
            { label: '분석 관리',  path: '/admin/analyses',    desc: '분석 잡 실행·결과 확인' },
          ].map(l => (
            <button key={l.label} className={styles.quickCard} onClick={() => navigate(l.path)}>
              <span className={styles.quickLabel}>{l.label}</span>
              <p className={styles.quickDesc}>{l.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {(naturalQ.isError || humanitiesQ.isError) && (
        <p className={styles.errorNote}>식당 데이터를 불러오지 못했습니다. 백엔드 서버를 확인하세요.</p>
      )}
    </div>
  );
}

export default AdminDashboardPage;
