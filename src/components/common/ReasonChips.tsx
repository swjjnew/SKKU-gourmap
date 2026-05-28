import styles from './ReasonChips.module.css';

interface Props {
  reasons: string[];
  /** 최대 표시 개수. 기본값 3 */
  max?: number;
}

/**
 * 추천 근거 문장을 칩(chip) 형태로 나열.
 * max 초과분은 "+N" 칩으로 축약 표시.
 *
 * @example
 * <ReasonChips reasons={['혼밥하기 좋아요', '가성비 최고']} />
 */
export function ReasonChips({ reasons, max = 3 }: Props) {
  if (!reasons || reasons.length === 0) return null;

  const visible = reasons.slice(0, max);
  const overflow = reasons.length - visible.length;

  return (
    <ul className={styles.list} aria-label="추천 이유">
      {visible.map((reason, i) => (
        <li key={i} className={styles.chip}>
          <span className={styles.icon} aria-hidden="true">✓</span>
          {reason}
        </li>
      ))}
      {overflow > 0 && (
        <li className={`${styles.chip} ${styles.overflow}`} aria-label={`외 ${overflow}개`}>
          +{overflow}
        </li>
      )}
    </ul>
  );
}
