/**
 * 디바운스 함수.
 * 검색창 입력, 지도 영역 변경 시 API 호출 빈도 제어 등에 사용.
 */
export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  delayMs: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}
