import { useEffect, useRef } from 'react';
import { useKakaoLoader } from '@hooks/useKakaoLoader';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_LEVEL } from '@config/mapConfig';
import Loading from '@components/common/Loading';
import ErrorMessage from '@components/common/ErrorMessage';
import type { LatLng, Restaurant } from '@/types';
import styles from './KakaoMap.module.css';

interface KakaoMapProps {
  /** 지도 중심 좌표. 미지정 시 DEFAULT_MAP_CENTER 사용. */
  center?: LatLng;
  /** 줌 레벨 (작을수록 확대). */
  level?: number;
  /** 표시할 맛집 마커들. */
  restaurants?: Restaurant[];
  /** 마커 클릭 시 콜백. */
  onMarkerClick?: (restaurant: Restaurant) => void;
}

/**
 * 카카오맵을 렌더링하는 기본 컴포넌트.
 *
 * 책임:
 *  - SDK 로드 상태에 따라 로딩/에러/지도 렌더링
 *  - props 로 받은 restaurants 를 마커로 표시
 *  - 마커 클릭 시 onMarkerClick 호출
 *
 * NOTE: 실제 인포윈도우/클러스터링/지도 영역 변경 이벤트 등은
 *       요구사항이 정해지면 단계적으로 추가합니다.
 */
function KakaoMap({
  center = DEFAULT_MAP_CENTER,
  level = DEFAULT_MAP_LEVEL,
  restaurants = [],
  onMarkerClick,
}: KakaoMapProps) {
  const { status, error } = useKakaoLoader();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);

  // 지도 초기화
  useEffect(() => {
    if (status !== 'ready' || !containerRef.current) return;
    const { kakao } = window;
    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level,
    });
    mapRef.current = map;
  }, [status, center, level]);

  // 마커 동기화
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return;
    const { kakao } = window;
    const map = mapRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 새 마커 추가
    restaurants.forEach((r) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(r.location.lat, r.location.lng),
        map,
        title: r.name,
      });

      if (onMarkerClick) {
        // kakao.maps.event.addListener 는 global.d.ts 에 아직 정의 안함 -
        // 실제 구현 시점에 SDK 의 event 모듈을 import 해서 보강 예정.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).kakao.maps.event.addListener(marker, 'click', () =>
          onMarkerClick(r),
        );
      }
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [status, restaurants, onMarkerClick]);

  if (status === 'loading' || status === 'idle') {
    return <Loading message="지도를 불러오는 중..." />;
  }
  if (status === 'error') {
    return (
      <ErrorMessage
        message={error?.message ?? '지도를 불러올 수 없습니다.'}
      />
    );
  }

  return <div ref={containerRef} className={styles.map} />;
}

export default KakaoMap;
