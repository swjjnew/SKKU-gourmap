/**
 * 카카오맵 JS SDK 타입 보강.
 * SDK가 window.kakao 로 전역 노출되므로 declare global 사용.
 *
 * 공식 @types 패키지가 없어 필요한 것만 점진적으로 추가.
 * 출처: https://apis.map.kakao.com/web/documentation/
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  namespace kakao.maps {
    // ── 이미 존재하지만 타입이 불완전한 클래스 보강 ──────

    interface Map {
      getBounds(): LatLngBounds;
      setCenter(latlng: LatLng): void;
      setLevel(level: number): void;
    }

    // ── 누락된 클래스 선언 ──────────────────────────────

    class MarkerImage {
      constructor(src: string, size: Size, options?: MarkerImageOptions);
    }

    interface MarkerImageOptions {
      offset?: Point;
      spriteSize?: Size;
      spriteOrigin?: Point;
    }

    class Size {
      constructor(width: number, height: number);
      width: number;
      height: number;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
    }

    class LatLngBounds {
      getSouthWest(): LatLng;
      getNorthEast(): LatLng;
      extend(latlng: LatLng): void;
      isEmpty(): boolean;
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions);
      setMap(map: Map | null): void;
      getMap(): Map | null;
      setPosition(latlng: LatLng): void;
      getPosition(): LatLng;
      setContent(content: string | HTMLElement): void;
      getContent(): string | HTMLElement;
      setVisible(visible: boolean): void;
      setZIndex(zIndex: number): void;
    }

    interface CustomOverlayOptions {
      map?: Map;
      position: LatLng;
      content: string | HTMLElement;
      xAnchor?: number;
      yAnchor?: number;
      zIndex?: number;
    }

    class MarkerClusterer {
      constructor(options: MarkerClustererOptions);
      addMarker(marker: Marker, nodraw?: boolean): void;
      addMarkers(markers: Marker[], nodraw?: boolean): void;
      removeMarker(marker: Marker, nodraw?: boolean): void;
      removeMarkers(markers: Marker[], nodraw?: boolean): void;
      clear(): void;
      redraw(): void;
      getMarkers(): Marker[];
      getSize(): number;
    }

    interface MarkerClustererOptions {
      map: Map;
      markers?: Marker[];
      gridSize?: number;
      averageCenter?: boolean;
      minLevel?: number;
      disableClickZoom?: boolean;
      styles?: object[];
    }

    // ── event 네임스페이스 ──────────────────────────────

    namespace event {
      function addListener(
        target: any,
        type: string,
        handler: (...args: any[]) => void,
      ): void;
      function removeListener(
        target: any,
        type: string,
        handler: (...args: any[]) => void,
      ): void;
      function trigger(target: any, type: string, data?: any): void;
    }
  }
}

export {};
