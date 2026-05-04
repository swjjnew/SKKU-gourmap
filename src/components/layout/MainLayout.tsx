import { Outlet } from 'react-router-dom';
import Header from './Header';
import styles from './MainLayout.module.css';

/**
 * 모든 페이지를 감싸는 최상위 레이아웃.
 * 헤더 + 본문(Outlet) 구조. 추후 footer / sidebar 추가 가능.
 */
function MainLayout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
