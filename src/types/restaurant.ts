export interface LatLng {
  lat: number;
  lng: number;
}

export interface Campus {
  id: number;
  slug: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

export type PriceRange = 'cheap' | 'normal' | 'expensive';

export interface RestaurantListItem {
  id: number;
  campusId: number;
  name: string;
  category: string;
  categoryCode: string;
  address: string;
  lat: number;
  lng: number;
  priceRange: PriceRange;
  priceLabel: string;
  thumbnailUrl?: string;
  tags: Tag[];
  summary?: string;
  recommendationScore?: number;
  recommendationReasons?: string[];
  hasAnalysis: boolean;
  parking?: boolean;
  waiting?: boolean;
}

export interface ReviewPoint {
  label: string;
  score: number;
  description: string;
}

export interface AnalysisMetadata {
  analyzedAt: string;
  reviewCount: number;
  reliabilityRate: number;
}

export interface RestaurantDetail {
  id: number;
  campusId: number;
  name: string;
  category: string;
  categoryCode: string;
  address: string;
  lat: number;
  lng: number;
  priceRange: PriceRange;
  priceLabel: string;
  phone?: string;
  openingHours?: string;
  closedDays?: string;
  thumbnailUrl?: string;
  imageUrls?: string[];
  tags: Tag[];
  parking?: boolean;
  waiting?: boolean;
  hasAnalysis: boolean;
  summary?: string;
  representativeMenu?: string;
  moodSummary?: string;
  parkingSummary?: string;
  waitingSummary?: string;
  averageTrustScore?: number;
  credibilityLabel?: number;
  recommendationScore?: number;
  recommendationReasons?: string[];
  reviewPoints?: ReviewPoint[];
  analysisMetadata?: AnalysisMetadata;
  createdAt?: string;
  updatedAt?: string;
}

export interface RestaurantFilter {
  campusId?: number;
  category?: string;
  priceRange?: PriceRange;
  mood?: string;
  parking?: boolean;
  waiting?: boolean;
  sort?: 'score' | 'name' | 'price';
  page?: number;
  size?: number;
}

export type AnalysisJobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface AnalysisJob {
  jobId: string;
  restaurantId: number;
  restaurantName: string;
  status: AnalysisJobStatus;
  progress: number;
  createdAt: string;
  completedAt?: string;
}
