import type { Restaurant } from '@/types';
import RestaurantCard from './RestaurantCard';
import styles from './RestaurantList.module.css';

interface RestaurantListProps {
  restaurants: Restaurant[];
  onItemClick?: (restaurant: Restaurant) => void;
  selectedId?: string | number | null;
}

function RestaurantList({
  restaurants,
  onItemClick,
  selectedId,
}: RestaurantListProps) {
  if (restaurants.length === 0) {
    return <div className={styles.empty}>표시할 맛집이 없습니다.</div>;
  }

  return (
    <ul className={styles.list}>
      {restaurants.map((r) => (
        <li key={r.id}>
          <RestaurantCard
            restaurant={r}
            selected={r.id === selectedId}
            onClick={() => onItemClick?.(r)}
          />
        </li>
      ))}
    </ul>
  );
}

export default RestaurantList;
