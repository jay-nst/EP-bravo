// EarthPaper Sprint A: Database types
// Derived from Supabase schema (00001_initial_schema.sql)

export type OrderStatus =
  | 'pending'
  | 'payment_held'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export type PaymentStatus =
  | 'held'
  | 'confirmed'
  | 'refund_queued'
  | 'refunded'
  | 'failed';

export type UserPlan = 'free' | 'pro' | 'annual';

export type TaskingStatus =
  | 'received'
  | 'reviewing'
  | 'quoted'
  | 'accepted'
  | 'rejected';

export type ChatRole = 'user' | 'assistant' | 'system';

export type SatelliteType = 'observer' | 'spaceeye-t';

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  phone: string | null;
  plan: UserPlan;
  chat_tokens_used: number;
  chat_tokens_limit: number;
  created_at: string;
  updated_at: string;
}

export interface CatalogItem {
  id: string;
  satellite: SatelliteType;
  resolution: string;
  supersolution: string | null;
  acquired_at: string;
  bbox: GeoJSON.Polygon;
  cloud_cover: number | null;
  cog_url: string;
  thumbnail_url: string | null;
  price_per_km2: number;
  min_area_km2: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  catalog_item_id: string;
  aoi: GeoJSON.Polygon;
  aoi_area_km2: number;
  status: OrderStatus;
  total_price: number;
  clip_job_id: string | null;
  clip_result_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  pg_provider: string;
  pg_payment_key: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  held_at: string | null;
  confirmed_at: string | null;
  refunded_at: string | null;
  pg_response: Record<string, unknown>;
  created_at: string;
}

export interface Download {
  id: string;
  order_id: string;
  user_id: string;
  file_url: string;
  file_size: number | null;
  expires_at: string;
  downloaded: boolean;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string | null;
  tokens_used: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: ChatRole;
  content: string;
  tokens: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type NotificationType =
  | 'order_completed'
  | 'order_failed'
  | 'tasking_update'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface TaskingRequest {
  id: string;
  user_id: string;
  aoi: GeoJSON.Polygon;
  preferred_date_from: string | null;
  preferred_date_to: string | null;
  contact_email: string;
  contact_phone: string | null;
  notes: string | null;
  status: TaskingStatus;
  created_at: string;
}

export type AnalyticsEventType =
  | 'cta_click'
  | 'page_view'
  | 'layer_toggle'
  | 'map_style_change'
  | 'form_submit';

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  event_type: AnalyticsEventType;
  event_name: string;
  properties: Record<string, unknown>;
  page_path: string | null;
  session_id: string | null;
  created_at: string;
}
