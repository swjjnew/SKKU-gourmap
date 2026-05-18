// FR-12: 관리자 로그인 화면
import { useNavigate } from 'react-router-dom';
import styles from './AdminLoginPage.module.css';

/**
 * AdminLoginPage
 * /admin/login — JWT 기반 관리자 인증 폼
 */
function AdminLoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 프로토타입: 폼 제출 시 바로 대시보드로 이동
    navigate('/admin/dashboard');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.badge}>FR-12</div>
        <h1 className={styles.title}>관리자 로그인</h1>
        <p className={styles.desc}>SKKU Gourmap 관리자 전용 페이지입니다.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>아이디</label>
            <input className={styles.input} type="text" placeholder="관리자 아이디" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>비밀번호</label>
            <input className={styles.input} type="password" placeholder="비밀번호" />
          </div>
          <div className={styles.securityNote}>
            🔒 JWT 토큰은 httpOnly 쿠키 또는 메모리 저장 (localStorage 사용 금지)
          </div>
          <button className={styles.submitBtn} type="submit">
            로그인 (프로토타입: 바로 대시보드 이동)
          </button>
        </form>

        <button className={styles.backLink} onClick={() => navigate('/')}>
          ← 메인으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default AdminLoginPage;
