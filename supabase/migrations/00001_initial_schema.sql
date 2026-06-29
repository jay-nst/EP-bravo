-- EarthPaper Sprint A: Initial Schema
-- 8 tables + RLS policies + indexes

-- Enable PostGIS extension for spatial queries
create extension if not exists postgis;

-- ============================================================
-- 1. profiles (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  name            text,
  company         text,
  phone           text,
  plan            text not null default 'free'
                  check (plan in ('free', 'pro', 'annual')),
  chat_tokens_used  int not null default 0,
  chat_tokens_limit int not null default 1000,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. imagery_catalog (admin-seeded, user read-only)
-- ============================================================
create table public.imagery_catalog (
  id              uuid primary key default gen_random_uuid(),
  satellite       text not null
                  check (satellite in ('observer', 'spaceeye-t')),
  resolution      text not null,
  supersolution   text,
  acquired_at     timestamptz not null,
  bbox            geometry(Polygon, 4326) not null,
  cloud_cover     real check (cloud_cover >= 0 and cloud_cover <= 100),
  cog_url         text not null,
  thumbnail_url   text,
  price_per_km2   numeric(10,2) not null,
  min_area_km2    numeric(10,2) not null,
  metadata        jsonb default '{}',
  created_at      timestamptz not null default now()
);

create index idx_catalog_bbox on imagery_catalog using gist(bbox);
create index idx_catalog_acquired on imagery_catalog(acquired_at desc);
create index idx_catalog_satellite on imagery_catalog(satellite);

-- ============================================================
-- 3. orders
-- ============================================================
create type order_status as enum (
  'pending',
  'payment_held',
  'processing',
  'completed',
  'failed',
  'refunded'
);

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id),
  catalog_item_id uuid not null references public.imagery_catalog(id),
  aoi             geometry(Polygon, 4326) not null,
  aoi_area_km2    numeric(10,2) not null,
  status          order_status not null default 'pending',
  total_price     numeric(12,2) not null,
  clip_job_id     text,
  clip_result_url text,
  error_message   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_orders_user on orders(user_id);
create index idx_orders_status on orders(status);

-- ============================================================
-- 4. payments (F1: 2-step payment pattern)
-- ============================================================
create type payment_status as enum (
  'held',
  'confirmed',
  'refund_queued',
  'refunded',
  'failed'
);

create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id),
  user_id         uuid not null references public.profiles(id),
  pg_provider     text not null default 'toss',
  pg_payment_key  text,
  amount          numeric(12,2) not null,
  currency        text not null default 'KRW',
  status          payment_status not null default 'held',
  held_at         timestamptz,
  confirmed_at    timestamptz,
  refunded_at     timestamptz,
  pg_response     jsonb default '{}',
  created_at      timestamptz not null default now()
);

create index idx_payments_order on payments(order_id);
create index idx_payments_status on payments(status);

-- ============================================================
-- 5. downloads
-- ============================================================
create table public.downloads (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id),
  user_id         uuid not null references public.profiles(id),
  file_url        text not null,
  file_size       bigint,
  expires_at      timestamptz not null,
  downloaded      boolean not null default false,
  created_at      timestamptz not null default now()
);

create index idx_downloads_user on downloads(user_id);
create index idx_downloads_order on downloads(order_id);

-- ============================================================
-- 6. chat_sessions (A2)
-- ============================================================
create table public.chat_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id),
  title           text,
  tokens_used     int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_chat_sessions_user on chat_sessions(user_id);

-- ============================================================
-- 7. chat_messages (A2)
-- ============================================================
create table public.chat_messages (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.chat_sessions(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'system')),
  content         text not null,
  tokens          int not null default 0,
  metadata        jsonb default '{}',
  created_at      timestamptz not null default now()
);

create index idx_chat_messages_session on chat_messages(session_id);

-- ============================================================
-- 8. tasking_requests (A3)
-- ============================================================
create table public.tasking_requests (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id),
  aoi                 geometry(Polygon, 4326) not null,
  preferred_date_from date,
  preferred_date_to   date,
  contact_email       text not null,
  contact_phone       text,
  notes               text,
  status              text not null default 'received'
                      check (status in ('received', 'reviewing', 'quoted', 'accepted', 'rejected')),
  created_at          timestamptz not null default now()
);

-- ============================================================
-- RLS Policies
-- ============================================================

-- profiles: own data only
alter table profiles enable row level security;
create policy "Users read own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);

-- imagery_catalog: all authenticated users can read
alter table imagery_catalog enable row level security;
create policy "Authenticated users read catalog"
  on imagery_catalog for select using (auth.role() = 'authenticated');

-- orders: own orders only
alter table orders enable row level security;
create policy "Users read own orders"
  on orders for select using (auth.uid() = user_id);
create policy "Users create orders"
  on orders for insert with check (auth.uid() = user_id);

-- payments: own payments read-only (writes via server only)
alter table payments enable row level security;
create policy "Users read own payments"
  on payments for select using (auth.uid() = user_id);

-- downloads: own downloads only
alter table downloads enable row level security;
create policy "Users read own downloads"
  on downloads for select using (auth.uid() = user_id);

-- chat_sessions: own sessions only
alter table chat_sessions enable row level security;
create policy "Users manage own chat sessions"
  on chat_sessions for all using (auth.uid() = user_id);

-- chat_messages: own messages only (via session ownership)
alter table chat_messages enable row level security;
create policy "Users read own chat messages"
  on chat_messages for select using (
    session_id in (select id from chat_sessions where user_id = auth.uid())
  );
create policy "Users create own chat messages"
  on chat_messages for insert with check (
    session_id in (select id from chat_sessions where user_id = auth.uid())
  );

-- tasking_requests: own requests only
alter table tasking_requests enable row level security;
create policy "Users manage own tasking requests"
  on tasking_requests for all using (auth.uid() = user_id);

-- ============================================================
-- updated_at trigger function
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on profiles
  for each row execute procedure update_updated_at();
create trigger set_updated_at before update on orders
  for each row execute procedure update_updated_at();
create trigger set_updated_at before update on chat_sessions
  for each row execute procedure update_updated_at();
