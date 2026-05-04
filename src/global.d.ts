/**
 * 전역 타입 선언.
 * 카카오맵 SDK가 window 에 주입되는 객체를 타입으로 노출합니다.
 * 추후 실제 사용에 따라 정확한 타입으로 보강하면 됩니다.
 */
export {};

declare global {
  interface Window {
    kakao: typeof kakao;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace kakao.maps {
    function load(callback: () => void): void;

    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      getLevel(): number;
      setLevel(level: number): void;
    }

    interface MapOptions {
      center: LatLng;
      level?: number;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      title?: string;
      image?: unknown;
    }

    class InfoWindow {
      constructor(options: InfoWindowOptions);
      open(map: Map, marker: Marker): void;
      close(): void;
    }

    interface InfoWindowOptions {
      content: string | HTMLElement;
      removable?: boolean;
    }
  }
}
