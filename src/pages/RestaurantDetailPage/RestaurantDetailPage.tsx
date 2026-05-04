import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchRestaurantById } from '@services/restaurantService';
import Loading from '@components/common/Loading';
import ErrorMessage from '@components/common/ErrorMessage';
import { formatPriceRange, formatRating } from '@utils/format';
import type { Restaurant } from '@/types';
import styles from './RestaurantDetailPage.module.css';

/**
 * 맛집 상세 페이지.
 * URL: /restaurants/:id
 */
function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchRestaurantById(id)
      .then((r) => {
        if (!cancelled) setRestaurant(r);
      })
      .catch((err: { message?: string }) => {
        if (!cancelled)
          setError(err?.message ?? '맛집 정보를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!restaurant) return <ErrorMessage message="맛집 정보를 찾을 수 없습니다." />;

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>
        ← 목록으로
      </Link>
      <h1 className={styles.title}>{restaurant.name}</h1>
      <div className={styles.meta}>
        <span>★ {formatRating(restaurant.rating)}</span>
        <span>{formatPriceRange(restaurant.priceRange)}</span>
        {restaurant.categories?.map((c) => (
          <span key={c.id} className={styles.category}>
            {c.name}
          </span>
        ))}
      </div>

      {restaurant.thumbnailUrl && (
        <img
          className={styles.thumb}
          src={restaurant.thumbnailUrl}
          alt={restaurant.name}
        />
      )}

      <section className={styles.section}>
        <h3>소개</h3>
        <p>{restaurant.description ?? '소개가 등록되지 않았습니다.'}</p>
      </section>

      <section className={styles.section}>
        <h3>위치</h3>
        <p>{restaurant.address}</p>
      </section>

      {restaurant.openingHours && (
        <section className={styles.section}>
          <h3>영업시간</h3>
          <p>{restaurant.openingHours}</p>
        </section>
      )}

      {restaurant.phone && (
        <section className={styles.section}>
          <h3>전화</h3>
          <p>{restaurant.phone}</p>
        </section>
      )}
    </div>
  );
}

export default RestaurantDetailPage;
