import type { LatLng } from '@/types';

/**
 * 두 좌표 사이의 거리(미터)를 Haversine 공식으로 계산.
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const R = 6_371_000; // 지구 반지름 (m)
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}
