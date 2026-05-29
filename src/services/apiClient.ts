import axios, { AxiosError, type AxiosInstance } from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '@config/apiConfig';
import { useAuthStore } from '@stores/authStore';
import type { ApiError } from '@/types';

/**
 * 공용 axios 인스턴스.
 * - baseURL, timeout 설정
 * - 응답 인터셉터에서 에러 형식 정규화
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT 토큰을 모든 요청 헤더에 자동 첨부 (NFR-S-01: 메모리 저장)
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; code?: string }>) => {
    const normalized: ApiError = {
      status: error.response?.status ?? 0,
      code: error.response?.data?.code,
      message:
        error.response?.data?.message ??
        error.message ??
        '알 수 없는 오류가 발생했습니다.',
    };
    return Promise.reject(normalized);
  },
);
