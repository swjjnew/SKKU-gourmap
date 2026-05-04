import { Link } from 'react-router-dom';
import { APP_NAME } from '@config/appConfig';
import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        {APP_NAME}
      </Link>
      <nav className={styles.nav}>
        {/* TODO: 검색창, 카테고리 필터, 로그인 등 추가 예정 */}
      </nav>
    </header>
  );
}

export default Header;
