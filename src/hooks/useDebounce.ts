import { useCallback, useRef } from 'react';

/**
 * 함수를 debounce 처리하는 React 훅.
 * 반환된 함수를 호출하면 delayMs 이후에 실제 fn이 실행된다.
 * 컴포넌트 unmount 시 자동으로 타이머가 해제된다.
 *
 * @example
 * const debouncedFetch = useDebounce((bounds: MapBounds) => fetchRestaurants(bounds), 300);
 */
export function useDebounce<T extends (...args: never[]) => unknown>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // fn을 ref로 감싸서 stale closure 방지
  const fnRef = useRef<T>(fn);
  fnRef.current = fn;

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        fnRef.current(...args);
      }, delayMs);
    },
    [delayMs],
  );
}
