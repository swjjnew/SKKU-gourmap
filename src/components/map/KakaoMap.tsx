import { useEffect, useRef, useCallback } from 'react';
import { useKakaoLoader } from '@hooks/useKakaoLoader';
import { useDebounce } from '@hooks/useDebounce';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_LEVEL } from '@config/mapConfig';
import Loading from '@components/common/Loading';
import ErrorMessage from '@components/common/ErrorMessage';
import type { LatLng, RestaurantListItem } from '@/types';
import styles from './KakaoMap.module.css';

export interface MapBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

interface KakaoMapProps {
  center?: LatLng;
  level?: number;
  restaurants?: RestaurantListItem[];
  onMarkerClick?: (restaurant: RestaurantListItem) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  selectedId?: number | null;
  onLoadError?: (error: Error) => void;
}

function buildOverlayContent(r: RestaurantListItem): string {
  const score =
    r.recommendationScore != null
      ? `<span class="ko-overlay-score">${r.recommendationScore}점</span>`
      : '';

  const tagsHtml = r.tags
    .slice(0, 3)
    .map(
      (t) =>
        `<span class="ko-overlay-tag" style="color:${t.color ?? '#555'};border-color:${t.color ?? '#ddd'}">${t.name}</span>`,
    )
    .join('');

  const summary = r.summary
    ? `<p class="ko-overlay-summary">${r.summary}</p>`
    : '';

  return `
    <div class="ko-overlay">
      <button type="button" class="ko-overlay-close" aria-label="닫기">✕</button>
      <strong class="ko-overlay-name">${r.name}</strong>
      <div class="ko-overlay-meta">${r.category} · ${r.priceLabel}${score}</div>
      ${tagsHtml ? `<div class="ko-overlay-tags">${tagsHtml}</div>` : ''}
      ${summary}
    </div>
  `;
}

function KakaoMap({
  center = DEFAULT_MAP_CENTER,
  level = DEFAULT_MAP_LEVEL,
  restaurants = [],
  onMarkerClick,
  onBoundsChange,
  selectedId = null,
  onLoadError,
}: KakaoMapProps) {
  const { status, error } = useKakaoLoader();

  useEffect(() => {
    if (status === 'error' && error && onLoadError) {
      onLoadError(error);
    }
  }, [status, error, onLoadError]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const clustererRef = useRef<kakao.maps.MarkerClusterer | null>(null);
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

  const debouncedBoundsChange = useDebounce(
    useCallback(
      (map: kakao.maps.Map) => {
        if (!onBoundsChange) return;
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        onBoundsChange({
          swLat: sw.getLat(),
          swLng: sw.getLng(),
          neLat: ne.getLat(),
          neLng: ne.getLng(),
        });
      },
      [onBoundsChange],
    ),
    300,
  );

  useEffect(() => {
    if (status !== 'ready' || !containerRef.current) return;
    const { kakao } = window;

    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level,
    });
    mapRef.current = map;

    // 클러스터러 초기화
    clustererRef.current = new kakao.maps.MarkerClusterer({
      map,
      averageCenter: true,
      minLevel: 6,
      disableClickZoom: false,
    });

    // bounds_changed 이벤트 등록
    kakao.maps.event.addListener(map, 'bounds_changed', () => {
      debouncedBoundsChange(map);
    });

    return () => {
      kakao.maps.event.removeListener(map, 'bounds_changed', () => {
        debouncedBoundsChange(map);
      });
      clustererRef.current?.clear();
    };
    // center/level 변경은 아래 별도 effect에서 처리
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter(
      new window.kakao.maps.LatLng(center.lat, center.lng),
    );
    mapRef.current.setLevel(level);
  }, [center, level]);

  const closeOverlay = useCallback(() => {
    overlayRef.current?.setMap(null);
    overlayRef.current = null;
  }, []);

  useEffect(() => {
    if (status !== 'ready' || !mapRef.current || !clustererRef.current) return;
    const { kakao } = window;
    const map = mapRef.current;

    clustererRef.current.clear();
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    closeOverlay();

    const newMarkers: kakao.maps.Marker[] = [];

    restaurants.forEach((r) => {
      const markerImage =
        r.id === selectedId
          ? new kakao.maps.MarkerImage(
              'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
              new kakao.maps.Size(31, 35),
            )
          : undefined;

      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(r.lat, r.lng),
        title: r.name,
        ...(markerImage ? { image: markerImage } : {}),
      });

      kakao.maps.event.addListener(marker, 'click', () => {
        closeOverlay();

        const content = buildOverlayContent(r);
        const overlay = new kakao.maps.CustomOverlay({
          content,
          position: new kakao.maps.LatLng(r.lat, r.lng),
          yAnchor: 1.35,
          zIndex: 10,
        });
        overlay.setMap(map);
        overlayRef.current = overlay;

        requestAnimationFrame(() => {
          const closeBtn = (overlay.getContent() as HTMLElement)?.querySelector?.(
            '.ko-overlay-close',
          );
          closeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            closeOverlay();
          });
        });

        onMarkerClick?.(r);
      });

      newMarkers.push(marker);
    });

    clustererRef.current.addMarkers(newMarkers);
    markersRef.current = newMarkers;

    return () => {
      clustererRef.current?.clear();
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
      closeOverlay();
    };
  }, [status, restaurants, selectedId, onMarkerClick, closeOverlay]);

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
