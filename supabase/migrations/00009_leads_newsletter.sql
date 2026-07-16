-- Add 'newsletter' to leads vertical constraint
alter table public.leads
  drop constraint if exists leads_vertical_check;
alter table public.leads
  add constraint leads_vertical_check
  check (vertical in ('citadel', 'predict', 'warden', 'northpaper', 'newsletter'));
