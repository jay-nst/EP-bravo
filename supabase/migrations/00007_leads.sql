-- EarthPaper: Lead Capture
-- 시뮬레이터 CTA를 통해 수집된 리드 정보 저장

create table public.leads (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  company     text not null,
  role        text not null
              check (role in ('compliance', 'finance', 'government', 'research', 'other')),
  use_case    text not null default '',
  budget      text not null default ''
              check (budget in ('', 'under_10k', '10k_50k', '50k_100k', 'over_100k')),
  vertical    text not null
              check (vertical in ('citadel', 'predict', 'warden', 'northpaper')),
  created_at  timestamptz not null default now()
);

create index idx_leads_vertical on public.leads(vertical);
create index idx_leads_created on public.leads(created_at desc);
create index idx_leads_email on public.leads(email);

-- RLS: 누구나 INSERT 가능 (로그인 불필요), SELECT는 service_role만
alter table public.leads enable row level security;

create policy "Anyone can submit leads"
  on public.leads for insert
  with check (true);

create policy "Service role reads leads"
  on public.leads for select
  using (auth.role() = 'service_role');
