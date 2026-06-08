import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@stores/authStore';
import { adminLogin } from '@services/adminService';
import styles from './AdminLoginPage.module.css';

const schema = z.object({
  username: z.string().min(1, '아이디를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
});
type FormValues = z.infer<typeof schema>;

function AdminLoginPage() {
  const navigate = useNavigate();
  const { setToken } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const { access_token, expires_in } = await adminLogin(values.username, values.password);
      setToken(access_token, expires_in ?? 3600);
      navigate('/admin/dashboard', { replace: true });
    } catch {
      setServerError('아이디 또는 비밀번호가 올바르지 않습니다.');
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
            {errors.username && <span className={styles.errorMsg}>{errors.username.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">비밀번호</label>
            <input
              id="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              type="password"
              placeholder="비밀번호"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password && <span className={styles.errorMsg}>{errors.password.message}</span>}
          </div>

          {serverError && <div className={styles.serverError}>{serverError}</div>}


          <button className={styles.submitBtn} type="submit" disabled={isSubmitting}>
            {isSubmitting ? '로그인 중…' : '로그인'}
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
