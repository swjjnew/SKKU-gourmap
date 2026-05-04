/**
 * 공통 API 응답 형태.
 * 백엔드와 협의해 실제 형태로 보강 예정.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  code?: string;
  message: string;
}
