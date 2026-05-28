// FR-12~15: 관리자 영역 공통 레이아웃 + JWT 가드
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '@stores/authStore';
import styles from './AdminLayout.module.css';

const NAV_ITEMS = [
  { to: '/admin/dashboard',    label: '📊 대시보드' },
  { to: '/admin/restaurants',  label: '🍽️ 식당 관리' },
  { to: '/admin/reviews',      label: '💬 리뷰 관리' },
  { to: '/admin/analyses',     label: '🤖 분석 관리' },
];

/**
 * AdminLayout
 * 관리자 영역 (/admin/*) 공통 레이아웃 — JWT 가드 포함.
 * isAuthenticated() false → /admin/login 리다이렉트 (FR-12)
 */
function AdminLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, clearToken } = useAuthStore();

  // ── JWT 가드 ─────────────────────────────────────────────────────
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    clearToken();
    navigate('/admin/login', { replace: true });
  };

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
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={styles.navFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
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
