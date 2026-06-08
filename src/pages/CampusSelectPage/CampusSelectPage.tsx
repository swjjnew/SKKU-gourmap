import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './CampusSelectPage.module.css';

function CampusSelectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(
    (location.state as { errorMessage?: string } | null)?.errorMessage ?? null
  );

  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {errorMessage && (
          <div className={styles.errorToast}>{errorMessage}</div>
        )}

        <h1 className={styles.title}>SKKU Gourmap</h1>
        <p className={styles.subtitle}>성균관대 맛집 지도</p>
        <p className={styles.desc}>어느 캠퍼스 맛집을 찾고 계신가요?</p>

        <div className={styles.buttons}>
          <button
            className={`${styles.campusBtn} ${styles.natural}`}
            onClick={() => navigate('/campus/natural')}
          >
            <span className={styles.campusIcon}>🌿</span>
            <span className={styles.campusName}>자연과학캠퍼스</span>
            <span className={styles.campusDetail}>수원 · 자과캠</span>
          </button>

          <button
            className={`${styles.campusBtn} ${styles.humanities}`}
            onClick={() => navigate('/campus/humanities')}
          >
            <span className={styles.campusIcon}>🏛️</span>
            <span className={styles.campusName}>인문사회캠퍼스</span>
            <span className={styles.campusDetail}>서울 · 인사캠</span>
          </button>
        </div>

        <button
          className={styles.adminLink}
          onClick={() => navigate('/admin/login')}
        >
          관리자 로그인 →
        </button>
      </div>
    </div>
  );
}

export default CampusSelectPage;
