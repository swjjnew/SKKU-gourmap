import styles from './EmptyState.module.css';

interface Props {
  /** 표시할 아이콘 (이모지 또는 SVG). 기본값: 🔍 */
  icon?: string;
  /** 주 메시지. 기본값: '조건에 맞는 식당이 없습니다' */
  message?: string;
  /** 보조 설명 */
  description?: string;
  /** 초기화 버튼 레이블. null이면 버튼 숨김 */
  resetLabel?: string | null;
  onReset?: () => void;
}

/**
 * 검색·필터 결과가 없을 때 표시하는 빈 상태 컴포넌트 (FR-16).
 */
export function EmptyState({
  icon = '🔍',
  message = '조건에 맞는 식당이 없습니다',
  description,
  resetLabel = '필터 초기화',
  onReset,
}: Props) {
  return (
    <div className={styles.container} role="status">
      <span className={styles.icon} aria-hidden="true">{icon}</span>
      <p className={styles.message}>{message}</p>
      {description && <p className={styles.description}>{description}</p>}
      {resetLabel && onReset && (
        <button type="button" className={styles.resetBtn} onClick={onReset}>
          {resetLabel}
        </button>
      )}
    </div>
  );
}
