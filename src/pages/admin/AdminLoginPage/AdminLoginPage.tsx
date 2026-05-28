// FR-12: 관리자 로그인 화면
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@stores/authStore';
import styles from './AdminLoginPage.module.css';

// ── 유효성 스키마 ────────────────────────────────────────────────
const schema = z.object({
  username: z.string().min(1, '아이디를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
});
type FormValues = z.infer<typeof schema>;

// ── API stub (백엔드 연결 전 임시) ──────────────────────────────
async function loginStub(username: string, _password: string): Promise<string> {
  // 실서버 연결 시 이 함수를 apiClient.post('/admin/auth/login', ...) 로 교체
  await new Promise(resolve => setTimeout(resolve, 600)); // 네트워크 지연 시뮬레이션
  if (username === 'admin') return 'stub-jwt-token';
  throw new Error('아이디 또는 비밀번호가 올바르지 않습니다.');
}

/**
 * AdminLoginPage
 * /admin/login — react-hook-form + zod 유효성 검사
 * JWT는 메모리(authStore)에만 저장 (NFR-S-01)
 */
function AdminLoginPage() {
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const token = await loginStub(values.username, values.password);
      setToken(token, 3600); // 1시간
      navigate('/admin/dashboard', { replace: true });
    } catch (e) {
      setServerError(e instanceof Error ? e.message : '로그인에 실패했습니다.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>관리자 로그인</h1>
        <p className={styles.desc}>SKKU Gourmap 관리자 전용 페이지입니다.</p>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">아이디</label>
            <input
              id="username"
              className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
              type="text"
              placeholder="관리자 아이디"
              autoComplete="username"
              {...register('username')}
            />
            {errors.username && (
              <span className={styles.errorMsg}>{errors.username.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">비밀번호</label>
            <input
              id="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              type="password"
              placeholder="비밀번호 (6자 이상)"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && (
              <span className={styles.errorMsg}>{errors.password.message}</span>
            )}
          </div>

          {serverError && (
            <div className={styles.serverError}>{serverError}</div>
          )}

          <div className={styles.securityNote}>
            🔒 JWT 토큰은 메모리에만 저장됩니다 (NFR-S-01)
          </div>

          <button
            className={styles.submitBtn}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? '로그인 중…' : '로그인'}
          </button>
        </form>

        <p className={styles.hint}>개발용 계정: admin / admin123</p>

        <button className={styles.backLink} onClick={() => navigate('/')}>
          ← 메인으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export default AdminLoginPage;
