/**
 * Skeleton UI 컴포넌트 모음.
 * 로딩 중 레이아웃 자리를 잡아주는 shimmer 블록.
 */
import styles from './Skeleton.module.css';

/** RestaurantCard 1장 스켈레톤 */
export function RestaurantCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitleRow}>
        <div className={styles.cardTitle} />
        <div className={styles.cardScore} />
      </div>
      <div className={styles.cardMeta} />
      <div className={styles.cardTagRow}>
        <div className={styles.cardTag} />
        <div className={styles.cardTag} />
        <div className={styles.cardTag} />
      </div>
      <div className={styles.cardSummary} />
      <div className={styles.cardSummary2} />
    </div>
  );
}

/** RestaurantCard N장 스켈레톤 */
export function RestaurantListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </>
  );
}

/** RestaurantDetailPage 스켈레톤 */
export function RestaurantDetailSkeleton() {
  return (
    <>
      <div className={styles.detailHero}>
        <div className={styles.detailThumb} />
        <div className={styles.detailInfo}>
          <div className={styles.detailName} />
          <div className={styles.detailMetaRow}>
            <div className={styles.detailMeta} />
            <div className={styles.detailMeta} />
          </div>
          <div className={styles.detailLine} />
          <div className={styles.detailLine2} />
        </div>
      </div>
      <SkeletonBlock />
      <SkeletonBlock />
    </>
  );
}

/** 범용 카드 블록 스켈레톤 */
export function SkeletonBlock() {
  return (
    <div className={styles.block}>
      <div className={styles.blockTitle} />
      <div className={styles.blockLine} />
      <div className={styles.blockLine2} />
      <div className={styles.blockLine3} />
    </div>
  );
}
