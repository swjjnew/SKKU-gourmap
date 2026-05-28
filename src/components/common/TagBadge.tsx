import type { Tag } from '@/types';
import styles from './TagBadge.module.css';

interface Props {
  tag: Tag;
  size?: 'sm' | 'md';
}

/**
 * 식당 태그 한 개를 배지 형태로 렌더링.
 * tag.color 가 있으면 해당 색을 배경으로, 없으면 기본 회색 팔레트 사용.
 *
 * @example
 * <TagBadge tag={{ id: 1, name: '혼밥', color: '#4f9cf9' }} />
 */
export function TagBadge({ tag, size = 'md' }: Props) {
  const style = tag.color
    ? ({
        '--badge-bg': `${tag.color}22`,   // 투명도 낮춘 배경
        '--badge-color': tag.color,
        '--badge-border': `${tag.color}66`,
      } as React.CSSProperties)
    : undefined;

  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={style}
      title={tag.name}
    >
      {tag.name}
    </span>
  );
}
