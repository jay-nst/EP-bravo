-- Notifications table for order status updates, tasking updates, etc.

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null
              check (type in ('order_completed', 'order_failed', 'tasking_update', 'system')),
  title       text not null,
  message     text not null,
  read        boolean not null default false,
  link        text,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id);
create index idx_notifications_unread on notifications(user_id, read) where read = false;

-- RLS: users see only their own notifications
alter table notifications enable row level security;
create policy "Users read own notifications"
  on notifications for select using (auth.uid() = user_id);

-- Helper function: create a notification (called by server/triggers)
create or replace function public.notify_user(
  target_user_id uuid,
  notification_type text,
  notification_title text,
  notification_message text,
  notification_link text default null
)
returns uuid as $$
declare
  new_id uuid;
begin
  insert into public.notifications (user_id, type, title, message, link)
  values (target_user_id, notification_type, notification_title, notification_message, notification_link)
  returning id into new_id;
  return new_id;
end;
$$ language plpgsql security definer;

-- Auto-notify on order completion
create or replace function public.on_order_status_change()
returns trigger as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    perform notify_user(
      new.user_id,
      'order_completed',
      '영상 준비 완료',
      '주문하신 위성 영상이 준비되었습니다. 다운로드해 주세요.',
      '/portal'
    );
  elsif new.status = 'failed' and old.status != 'failed' then
    perform notify_user(
      new.user_id,
      'order_failed',
      '주문 처리 실패',
      coalesce('오류: ' || new.error_message, '주문 처리 중 문제가 발생했습니다.'),
      '/portal'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_order_status_change
  after update of status on orders
  for each row execute procedure on_order_status_change();

-- Auto-notify on tasking request status change
create or replace function public.on_tasking_status_change()
returns trigger as $$
begin
  if new.status != old.status then
    perform notify_user(
      new.user_id,
      'tasking_update',
      '촬영 요청 상태 변경',
      '촬영 요청 상태가 "' || new.status || '"(으)로 변경되었습니다.',
      '/tasking'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_tasking_status_change
  after update of status on tasking_requests
  for each row execute procedure on_tasking_status_change();
