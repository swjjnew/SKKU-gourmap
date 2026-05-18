// FR-12~15: 관리자 영역 공통 레이아웃
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: '📊 대시보드', fr: 'FR-13' },
  { to: '/admin/restaurants', label: '🍽️ 식당 관리', fr: 'FR-13' },
  { to: '/admin/reviews', label: '💬 리뷰 관리', fr: 'FR-14' },
  { to: '/admin/analyses', label: '🤖 분석 관리', fr: 'FR-15' },
];

/**
 * AdminLayout
 * 관리자 영역 (/admin/*) 공통 레이아웃 — 사이드 내비 + 콘텐츠
 */
function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <div className={styles.navHeader}>
          <div className={styles.navTitle}>SKKU Gourmap</div>
          <div className={styles.navSubtitle}>관리자</div>
        </div>
        <ul className={styles.navList}>
          {NAV_ITEMS.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <span>{item.label}</span>
                <span className={styles.frBadge}>{item.fr}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        <div className={styles.navFooter}>
          <button className={styles.logoutBtn} onClick={() => navigate('/admin/login')}>
            로그아웃
          </button>
          <button className={styles.mainBtn} onClick={() => navigate('/')}>
            서비스 홈 →
          </button>
        </div>
      </nav>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
