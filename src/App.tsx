import { Routes, Route, Navigate } from 'react-router-dom';

import CampusSelectPage from '@pages/CampusSelectPage/CampusSelectPage';
import HomePage from '@pages/HomePage/HomePage';
import ListOnlyPage from '@pages/ListOnlyPage/ListOnlyPage';
import RestaurantDetailPage from '@pages/RestaurantDetailPage/RestaurantDetailPage';
import NotFoundPage from '@pages/NotFoundPage/NotFoundPage';

import AdminLayout from '@components/layout/AdminLayout';
import AdminLoginPage from '@pages/admin/AdminLoginPage/AdminLoginPage';
import AdminDashboardPage from '@pages/admin/AdminDashboardPage/AdminDashboardPage';
import AdminRestaurantsPage from '@pages/admin/AdminRestaurantsPage/AdminRestaurantsPage';
import AdminReviewsPage from '@pages/admin/AdminReviewsPage/AdminReviewsPage';
import AdminAnalysesPage from '@pages/admin/AdminAnalysesPage/AdminAnalysesPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CampusSelectPage />} />
      <Route path="/campus/:slug" element={<HomePage />} />
      <Route path="/campus/:slug/list" element={<ListOnlyPage />} />
      <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="restaurants" element={<AdminRestaurantsPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="analyses" element={<AdminAnalysesPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
