import type { AnalyticsEventType } from '@/types/database';

let sessionId: string | null = null;

function getSessionId(): string {
  if (sessionId) return sessionId;
  if (typeof window === 'undefined') return '';

  try {
    const stored = sessionStorage.getItem('ep_session_id');
    if (stored) {
      sessionId = stored;
      return stored;
    }
  } catch {
    // sessionStorage unavailable
  }

  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    sessionStorage.setItem('ep_session_id', id);
  } catch {
    // sessionStorage unavailable (private mode, disabled cookies)
  }
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
