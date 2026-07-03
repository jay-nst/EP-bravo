import type { AnalyticsEventType } from '@/types/database';

let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;
  if (typeof window === 'undefined') return '';

  const stored = sessionStorage.getItem('ep_session_id');
  if (stored) {
    sessionId = stored;
    return stored;
  }

  const id = crypto.randomUUID();
  sessionStorage.setItem('ep_session_id', id);
  sessionId = id;
  return id;
}

export function trackEvent(
  eventType: AnalyticsEventType,
  eventName: string,
  properties: Record<string, unknown> = {},
) {
  if (typeof window === 'undefined') return;

  const payload = {
    event_type: eventType,
    event_name: eventName,
    properties,
    page_path: window.location.pathname,
    session_id: getSessionId(),
  };

  navigator.sendBeacon(
    '/api/events',
    new Blob([JSON.stringify(payload)], { type: 'application/json' }),
  );
}
