export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const API_TIMEOUT_MS = 10_000;

export const API_ENDPOINTS = {
  campuses: '/campuses/',
  restaurantsByCampus: (slug: string) => `/campuses/${slug}/restaurants`,
  recommendationsByCampus: (slug: string) => `/campuses/${slug}/recommendations`,
  restaurantById: (id: number | string) => `/restaurants/${id}`,
  adminLogin: '/admin/auth/login',
  adminRestaurants: '/admin/restaurants',
  adminRestaurantById: (id: number | string) => `/admin/restaurants/${id}`,
  adminReviewsUpload: '/admin/reviews/upload',
  adminAnalysisJobs: '/admin/analysis-jobs',
  adminAnalysisJobById: (jobId: string) => `/admin/analysis-jobs/${jobId}`,
} as const;
