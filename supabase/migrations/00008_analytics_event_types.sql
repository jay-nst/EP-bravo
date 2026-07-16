-- analytics_events: 신규 event_type 추가
-- simulator_event, map_style_change, chat_from_home

alter table public.analytics_events
  drop constraint if exists analytics_events_event_type_check;

alter table public.analytics_events
  add constraint analytics_events_event_type_check
  check (event_type in (
    'cta_click',
    'page_view',
    'layer_toggle',
    'form_submit',
    'map_style_change',
    'chat_from_home',
    'simulator_event'
  ));
