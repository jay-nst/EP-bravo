export type FeedType = 'analysis' | 'shorts' | 'trending' | 'news' | 'community' | 'report' | 'citadel' | 'warden' | 'predict' | 'northpaper';

export interface FeedItem {
  id: string;
  type: FeedType;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  link_url: string | null;
  link_action: 'navigate' | 'external' | 'inline';
  metadata: Record<string, unknown>;
  published_at: string;
}

export interface WatchlistArea {
  id: string;
  name: string;
  geometry: GeoJSON.Polygon;
  new_images_count: number;
  created_at: string;
}

export interface DailyScene {
  id: string;
  satellite: string;
  location: string;
  acquired_at: string;
  resolution: string;
  thumbnail_url: string | null;
}

export interface EditorPick {
  id: string;
  tag: string;
  title: string;
  description: string;
  link_url: string;
  published_at: string;
  source: string;
}

export interface DashboardSummary {
  dailyScene: DailyScene | null;
  editorPick: EditorPick | null;
  recentOrders: {
    id: string;
    status: string;
    aoi_area_km2: number;
    total_price: number;
    created_at: string;
  }[];
  stats: {
    totalImages: number;
    totalAreaKm2: number;
    memberSince: string;
  };
  watchlist: WatchlistArea[];
  pendingTaskings: number;
}

export const FEED_BADGE_COLORS: Record<FeedType, string> = {
  analysis: '#22d3ee',
  shorts: '#ec4899',
  trending: '#f59e0b',
  news: '#8b5cf6',
  community: '#10b981',
  report: '#f97316',
  citadel: '#C45C4A',
  warden: '#6B8A5E',
  predict: '#4A9EC4',
  northpaper: '#3D5A80',
};

export const FEED_LABELS: Record<FeedType, string> = {
  analysis: 'AI 분석',
  shorts: '숏츠',
  trending: '트렌딩',
  news: '뉴스',
  community: '커뮤니티',
  report: '리포트',
  citadel: '재난 · 도시',
  warden: '기후·환경',
  predict: '자산·금융',
  northpaper: '국방·안보',
};
