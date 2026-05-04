/**
 * 표시용 포매팅 헬퍼.
 */

/**
 * 평점을 소수점 1자리까지 보여주기 (5점 만점).
 */
export function formatRating(rating?: number): string {
  if (rating === undefined || Number.isNaN(rating)) return '-';
  return rating.toFixed(1);
}

/**
 * 가격대를 ₩ 기호로 표시.
 * 1=₩, 2=₩₩, 3=₩₩₩, 4=₩₩₩₩
 */
export function formatPriceRange(level?: number): string {
  if (!level || level < 1) return '-';
  return '₩'.repeat(Math.min(level, 4));
}

/**
 * 거리(미터)를 사람이 읽기 좋은 형태로.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
