import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '@config/apiConfig';
import type {
  ApiResponse,
  BoundsQuery,
  PageResponse,
  Restaurant,
  RestaurantId,
  RestaurantSearchParams,
} from '@/types';

/**
 * 맛집 관련 API 호출 모음.
 * 페이지/컴포넌트는 이 모듈만 import 해서 사용합니다.
 *
 * NOTE: 백엔드 명세가 확정되면 응답 매핑을 정확히 맞춰야 합니다.
 *       현재는 가장 그럴싸한 기본형으로 작성된 stub 입니다.
 */

export async function fetchRestaurants(
  params?: RestaurantSearchParams,
): Promise<PageResponse<Restaurant>> {
  const { data } = await apiClient.get<ApiResponse<PageResponse<Restaurant>>>(
    API_ENDPOINTS.restaurants,
    { params },
  );
  return data.data;
}

export async function fetchRestaurantById(id: RestaurantId): Promise<Restaurant> {
  const { data } = await apiClient.get<ApiResponse<Restaurant>>(
    API_ENDPOINTS.restaurantById(id),
  );
  return data.data;
}

export async function fetchRestaurantsByBounds(
  bounds: BoundsQuery,
): Promise<Restaurant[]> {
  const { data } = await apiClient.get<ApiResponse<Restaurant[]>>(
    API_ENDPOINTS.restaurantsByBounds,
    { params: bounds },
  );
  return data.data;
}

export async function searchRestaurants(
  keyword: string,
): Promise<Restaurant[]> {
  const { data } = await apiClient.get<ApiResponse<Restaurant[]>>(
    API_ENDPOINTS.search,
    { params: { keyword } },
  );
  return data.data;
}
