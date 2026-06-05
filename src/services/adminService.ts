import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@config/apiConfig';
import type { RestaurantListItem, AnalysisJob } from '@/types';

// ────────────────────────────────────────────────────────────────
// 인증
// ────────────────────────────────────────────────────────────────

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in?: number; // 초 단위
}

export async function adminLogin(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    API_ENDPOINTS.adminLogin,
    { username, password },
  );
  return data;
}

// ────────────────────────────────────────────────────────────────
// 식당 관리 (CRUD)
// ────────────────────────────────────────────────────────────────

export interface AdminRestaurantPayload {
  name: string;
  address: string;
  campusSlug: string;
  category: string;
  priceLevel: string;   // '저렴함' | '보통' | '비쌈'
  lat: number;
  lng: number;
  phone?: string;
  sourceUrl?: string;
  externalId?: string;  // 카카오 등 외부 식당 식별자
}

export async function fetchAdminRestaurants(): Promise<RestaurantListItem[]> {
  const { data } = await apiClient.get<RestaurantListItem[]>(
    API_ENDPOINTS.adminRestaurants,
  );
  return data;
}

export async function createRestaurant(
  payload: AdminRestaurantPayload,
): Promise<RestaurantListItem> {
  const { data } = await apiClient.post<RestaurantListItem>(
    API_ENDPOINTS.adminRestaurants,
    payload,
  );
  return data;
}

export async function updateRestaurant(
  id: number,
  payload: Partial<AdminRestaurantPayload>,
): Promise<RestaurantListItem> {
  const { data } = await apiClient.put<RestaurantListItem>(
    API_ENDPOINTS.adminRestaurantById(id),
    payload,
  );
  return data;
}

export async function deleteRestaurant(id: number): Promise<void> {
  await apiClient.delete(API_ENDPOINTS.adminRestaurantById(id));
}

// ────────────────────────────────────────────────────────────────
// 리뷰 관리
// ────────────────────────────────────────────────────────────────

export interface UploadResult {
  insertedCount: number;
  skippedCount: number;
  errorCount: number;
  errors?: string[];
}

/** CSV 파일 업로드 (multipart/form-data) */
export async function uploadReviewCSV(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<UploadResult>(
    API_ENDPOINTS.adminReviewsUpload,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data;
}

// ────────────────────────────────────────────────────────────────
// 분석 잡
// ────────────────────────────────────────────────────────────────

export async function fetchAnalysisJobs(): Promise<AnalysisJob[]> {
  const { data } = await apiClient.get<AnalysisJob[]>(
    API_ENDPOINTS.adminAnalysisJobs,
  );
  return data;
}

export async function startAnalysisJob(restaurantId: number): Promise<AnalysisJob> {
  const { data } = await apiClient.post<AnalysisJob>(
    API_ENDPOINTS.adminAnalysisJobs,
    { restaurantId },
  );
  return data;
}

export async function fetchAnalysisJobById(jobId: string): Promise<AnalysisJob> {
  const { data } = await apiClient.get<AnalysisJob>(
    API_ENDPOINTS.adminAnalysisJobById(jobId),
  );
  return data;
}
