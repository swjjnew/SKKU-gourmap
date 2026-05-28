/**
 * 카테고리 서비스.
 * 현재 백엔드 API에 별도 /categories 엔드포인트가 없으므로
 * 식당 목록 데이터에서 categoryCode / category 를 추출해 사용.
 *
 * 백엔드에서 /categories 엔드포인트가 추가되면 아래 주석 해제.
 */

// import { apiClient } from './apiClient';
// import { API_ENDPOINTS } from '@config/apiConfig';
// import type { ApiResponse, Category } from '@/types';

// export async function fetchCategories(): Promise<Category[]> {
//   const { data } = await apiClient.get<ApiResponse<Category[]>>(
//     API_ENDPOINTS.categories,
//   );
//   return data.data;
// }

export {};
