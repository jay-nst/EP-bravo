-- EarthPaper: Analytics Events
-- CTA click, page view, layer toggle 등 기본 이벤트 트래킹

create table public.analytics_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  event_type  text not null
              check (event_type in ('cta_click', 'page_view', 'layer_toggle', 'form_submit')),
  event_name  text not null,
  properties  jsonb not null default '{}',
  page_path   text,
  session_id  text,
  created_at  timestamptz not null default now()
);

create index idx_events_type_created on public.analytics_events(event_type, created_at desc);
create index idx_events_name on public.analytics_events(event_name);
create index idx_events_user on public.analytics_events(user_id) where user_id is not null;

-- RLS: 누구나 이벤트 INSERT 가능 (로그인 불필요), SELECT는 service_role만
alter table public.analytics_events enable row level security;

create policy "Anyone can insert events"
  on public.analytics_events for insert
  with check (true);

create policy "Service role reads events"
  on public.analytics_events for select
  using (auth.role() = 'service_role');
