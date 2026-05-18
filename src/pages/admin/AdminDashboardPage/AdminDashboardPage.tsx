// FR-13: 관리자 대시보드
import { useNavigate } from 'react-router-dom';
import styles from './AdminDashboardPage.module.css';

/**
 * AdminDashboardPage
 * /admin/dashboard — 데이터 현황 요약 카드
 */
function AdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>대시보드</h1>
        <span className={styles.badge}>FR-13</span>
      </div>

      <div className={styles.statsGrid}>
        {[
          { label: '전체 식당', value: '148', icon: '🍽️', color: '#eff6ff' },
          { label: '전체 리뷰', value: '2,341', icon: '💬', color: '#f0fdf4' },
          { label: '분석 완료', value: '112', icon: '✅', color: '#fef3c7' },
          { label: '분석 대기', value: '36', icon: '⏳', color: '#fef2f2' },
        ].map(s => (
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
            { label: '식당 관리', path: '/admin/restaurants', fr: 'FR-13', desc: '식당 추가·수정·삭제' },
            { label: '리뷰 관리', path: '/admin/reviews', fr: 'FR-14', desc: '리뷰 검토 및 삭제' },
            { label: '분석 관리', path: '/admin/analyses', fr: 'FR-15', desc: 'CSV 업로드, 분석 잡 폴링' },
          ].map(l => (
            <button
              key={l.label}
              className={styles.quickCard}
              onClick={() => navigate(l.path)}
            >
              <div className={styles.quickTop}>
                <span className={styles.quickLabel}>{l.label}</span>
                <span className={styles.frBadge}>{l.fr}</span>
              </div>
              <p className={styles.quickDesc}>{l.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>최근 변경 이력 (FR-13)</h2>
        <div className={styles.logPlaceholder}>
          <p>최근 관리자 작업 로그가 표시되는 영역입니다.</p>
          <p>식당 추가/수정/삭제, 분석 실행 등의 이력을 타임라인으로 보여줍니다.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
