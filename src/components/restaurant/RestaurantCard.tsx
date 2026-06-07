import type { RestaurantListItem } from '@/types';
import { TagBadge } from '@components/common/TagBadge';
import { ReasonChips } from '@components/common/ReasonChips';
import styles from './RestaurantCard.module.css';

interface RestaurantCardProps {
  restaurant: RestaurantListItem;
  selected?: boolean;
  onClick?: () => void;
}

/**
 * 사이드바 식당 목록 한 항목.
 * - 썸네일 (있을 때)
 * - 이름 + 카테고리 + 가격 레이블
 * - 추천 점수 배지 (hasAnalysis 일 때)
 * - 태그 배지 (최대 3개)
 * - 추천 근거 칩 (최대 3개)
 * - 요약 (있을 때)
 */
function RestaurantCard({ restaurant, selected, onClick }: RestaurantCardProps) {
  const {
    name,
    category,
    priceLabel,
    thumbnailUrl,
    tags,
    summary,
    recommendationReasons,
    hasAnalysis,
    address,
  } = restaurant;

  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      {thumbnailUrl && (
        <img className={styles.thumb} src={thumbnailUrl} alt={name} loading="lazy" />
      )}

      <div className={styles.body}>
        {/* 이름 */}
        <div className={styles.titleRow}>
          <span className={styles.name}>{name}</span>
        </div>

        {/* 카테고리 · 가격 */}
        <div className={styles.meta}>
          <span>{category}</span>
          <span className={styles.dot}>·</span>
          <span>{priceLabel}</span>
        </div>

        {/* 태그 배지 */}
        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} tag={tag} size="sm" />
            ))}
          </div>
        )}

        {/* 추천 근거 칩 */}
        {hasAnalysis && recommendationReasons && recommendationReasons.length > 0 && (
          <div className={styles.reasons}>
            <ReasonChips reasons={recommendationReasons} max={2} />
          </div>
        )}

        {/* 요약 */}
        {summary && <p className={styles.summary}>{summary}</p>}

        {/* 주소 */}
        <div className={styles.address}>{address}</div>
      </div>
    </button>
  );
}

export default RestaurantCard;
