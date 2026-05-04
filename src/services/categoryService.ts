import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@config/apiConfig';
import type { ApiResponse, Category } from '@/types';

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<ApiResponse<Category[]>>(
    API_ENDPOINTS.categories,
  );
  return data.data;
}
