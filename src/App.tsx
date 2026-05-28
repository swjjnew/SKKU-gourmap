import { Routes, Route, Navigate } from 'react-router-dom';

// 일반 페이지
import CampusSelectPage from '@pages/CampusSelectPage/CampusSelectPage';
import HomePage from '@pages/HomePage/HomePage';
import RestaurantDetailPage from '@pages/RestaurantDetailPage/RestaurantDetailPage';
import NotFoundPage from '@pages/NotFoundPage/NotFoundPage';

// 관리자 레이아웃 + 페이지
import AdminLayout from '@components/layout/AdminLayout';
import AdminLoginPage from '@pages/admin/AdminLoginPage/AdminLoginPage';
import AdminDashboardPage from '@pages/admin/AdminDashboardPage/AdminDashboardPage';
import AdminRestaurantsPage from '@pages/admin/AdminRestaurantsPage/AdminRestaurantsPage';
import AdminReviewsPage from '@pages/admin/AdminReviewsPage/AdminReviewsPage';
import AdminAnalysesPage from '@pages/admin/AdminAnalysesPage/AdminAnalysesPage';

/**
 * 앱 최상위 컴포넌트 — 라우팅 정의
 *
 * /                          → CampusSelectPage         (FR-01)
 * /campus/:slug              → HomePage (지도+리스트)   (FR-02~07)
 * /restaurants/:id           → RestaurantDetailPage     (FR-05)
 * /admin/login               → AdminLoginPage           (FR-12)
 * /admin/*                   → AdminLayout (JWT 가드)   (FR-13~15)
 *   /admin/dashboard         → AdminDashboardPage
 *   /admin/restaurants       → AdminRestaurantsPage
 *   /admin/reviews           → AdminReviewsPage
 *   /admin/analyses          → AdminAnalysesPage
 */
function App() {
  return (
    <Routes>
      {/* 진입 화면: 캠퍼스 선택 */}
      <Route path="/" element={<CampusSelectPage />} />

      {/* 캠퍼스별 지도+리스트 */}
      <Route path="/campus/:slug" element={<HomePage />} />

      {/* 식당 상세 */}
      <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />

      {/* 관리자 로그인 (레이아웃 없음) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* 관리자 영역 (AdminLayout + JWT 가드 예정) */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* /admin → /admin/dashboard 리다이렉트 */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="restaurants" element={<AdminRestaurantsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="analyses" element={<AdminAnalysesPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
