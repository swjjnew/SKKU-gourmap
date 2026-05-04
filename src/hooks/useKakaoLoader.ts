import { useEffect, useState } from 'react';
import { KAKAO_MAP_KEY, KAKAO_MAP_SDK_URL } from '@config/mapConfig';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

let cachedPromise: Promise<void> | null = null;

/**
 * 카카오맵 SDK를 동적으로 1회만 로드한다.
 * - script 태그를 head 에 주입
 * - kakao.maps.load() 콜백이 끝나면 ready 상태로 전환
 * - 같은 페이지에서 여러 컴포넌트가 호출해도 안전 (cachedPromise 공유)
 */
function loadKakaoSdk(): Promise<void> {
  if (cachedPromise) return cachedPromise;

  cachedPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('window is not available'));
      return;
    }

    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    if (!KAKAO_MAP_KEY) {
      reject(
        new Error(
          'VITE_KAKAO_MAP_KEY 가 설정되지 않았습니다. .env 파일을 확인하세요.',
        ),
      );
      return;
    }

    const script = document.createElement('script');
    script.src = KAKAO_MAP_SDK_URL(KAKAO_MAP_KEY);
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () =>
      reject(new Error('카카오맵 SDK 로드에 실패했습니다.'));
    document.head.appendChild(script);
  });

  return cachedPromise;
}

/**
 * 카카오맵 SDK 로드 상태를 반환하는 훅.
 *
 * 사용 예:
 *   const { status, error } = useKakaoLoader();
 *   if (status !== 'ready') return <Loading />;
 */
export function useKakaoLoader() {
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setStatus('loading');
    loadKakaoSdk()
      .then(() => {
        if (mounted) setStatus('ready');
      })
      .catch((err: Error) => {
        if (!mounted) return;
        setError(err);
        setStatus('error');
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { status, error };
}
