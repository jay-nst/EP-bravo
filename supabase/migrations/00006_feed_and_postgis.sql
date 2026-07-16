-- Feed items table + PostGIS spatial search RPC
-- Supports editorial feed (homepage) and catalog spatial queries

-- ============================================================
-- feed_items: editorial content for homepage feed
-- ============================================================
create table public.feed_items (
  id              text primary key,
  type            text not null
                  check (type in ('analysis', 'shorts', 'trending', 'news', 'community', 'report', 'citadel', 'warden', 'predict', 'northpaper')),
  title           text not null,
  description     text,
  thumbnail_url   text,
  link_url        text,
  link_action     text not null default 'external'
                  check (link_action in ('navigate', 'external', 'inline')),
  metadata        jsonb not null default '{}',
  published_at    timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index idx_feed_items_type on feed_items(type);
create index idx_feed_items_published on feed_items(published_at desc);

-- feed_items: public read (no auth required for homepage content)
alter table feed_items enable row level security;
create policy "Anyone can read feed items"
  on feed_items for select using (true);

-- ============================================================
-- watchlist_areas: user-saved monitoring areas
-- ============================================================
create table public.watchlist_areas (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  geometry        geometry(Polygon, 4326) not null,
  created_at      timestamptz not null default now()
);

create index idx_watchlist_user on watchlist_areas(user_id);
create index idx_watchlist_geom on watchlist_areas using gist(geometry);

alter table watchlist_areas enable row level security;
create policy "Users manage own watchlist"
  on watchlist_areas for all using (auth.uid() = user_id);

-- ============================================================
-- PostGIS spatial search RPC for catalog
-- ============================================================
create or replace function public.search_catalog_by_bbox(
  p_west double precision,
  p_south double precision,
  p_east double precision,
  p_north double precision,
  p_satellite text default null,
  p_max_cloud_cover real default null,
  p_limit int default 20
)
returns setof public.imagery_catalog as $$
begin
  return query
  select *
  from public.imagery_catalog
  where ST_Intersects(
    bbox,
    ST_MakeEnvelope(p_west, p_south, p_east, p_north, 4326)
  )
  and (p_satellite is null or satellite = p_satellite)
  and (p_max_cloud_cover is null or cloud_cover <= p_max_cloud_cover)
  order by acquired_at desc
  limit p_limit;
end;
$$ language plpgsql security definer;

-- ============================================================
-- Helper: count new images in a watchlist area (last 7 days)
-- ============================================================
create or replace function public.count_new_images_for_watchlist(
  p_watchlist_id uuid
)
returns int as $$
declare
  v_count int;
begin
  select count(*) into v_count
  from public.imagery_catalog ic
  join public.watchlist_areas wa on wa.id = p_watchlist_id
  where ST_Intersects(ic.bbox, wa.geometry)
    and ic.acquired_at > now() - interval '7 days';
  return v_count;
end;
$$ language plpgsql security definer;
