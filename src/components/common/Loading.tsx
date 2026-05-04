import styles from './Loading.module.css';

interface LoadingProps {
  message?: string;
}

function Loading({ message = '불러오는 중...' }: LoadingProps) {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} aria-hidden />
      <span>{message}</span>
    </div>
  );
}

export default Loading;
