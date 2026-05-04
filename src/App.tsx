import { Routes, Route } from 'react-router-dom';
import MainLayout from '@components/layout/MainLayout';
import HomePage from '@pages/HomePage/HomePage';
import RestaurantDetailPage from '@pages/RestaurantDetailPage/RestaurantDetailPage';
import NotFoundPage from '@pages/NotFoundPage/NotFoundPage';

/**
 * 앱 최상위 컴포넌트.
 * 라우팅과 전역 레이아웃을 정의합니다.
 *
 * 라우트 구조:
 *  /                         - 메인(지도 + 맛집 리스트)
 *  /restaurants/:id          - 맛집 상세 페이지
 *  *                         - 404
 */
function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
