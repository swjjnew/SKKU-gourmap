import type { Restaurant } from '@/types';
import { formatPriceRange, formatRating } from '@utils/format';
import styles from './RestaurantCard.module.css';

interface RestaurantCardProps {
  restaurant: Restaurant;
  selected?: boolean;
  onClick?: () => void;
}

function RestaurantCard({ restaurant, selected, onClick }: RestaurantCardProps) {
  const { name, address, rating, priceRange, thumbnailUrl, categories } =
    restaurant;

  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      {thumbnailUrl && (
        <img className={styles.thumb} src={thumbnailUrl} alt={name} />
      )}
      <div className={styles.body}>
        <div className={styles.title}>{name}</div>
        <div className={styles.meta}>
          <span>★ {formatRating(rating)}</span>
          <span>{formatPriceRange(priceRange)}</span>
          {categories && categories.length > 0 && (
            <span>{categories.map((c) => c.name).join(' · ')}</span>
          )}
        </div>
        <div className={styles.address}>{address}</div>
      </div>
    </button>
  );
}

export default RestaurantCard;
