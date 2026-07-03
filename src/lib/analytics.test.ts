import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('trackEvent', () => {
  let sendBeaconSpy: ReturnType<typeof vi.fn>;
  let sessionStorageMock: Record<string, string>;

  beforeEach(() => {
    sendBeaconSpy = vi.fn(() => true);
    sessionStorageMock = {};

    vi.stubGlobal('window', { location: { pathname: '/test-page' } });
    vi.stubGlobal('navigator', { sendBeacon: sendBeaconSpy });
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => sessionStorageMock[key] ?? null,
      setItem: (key: string, value: string) => {
        sessionStorageMock[key] = value;
      },
    });
    vi.stubGlobal('crypto', {
      randomUUID: () => 'test-uuid-1234',
    });
    vi.stubGlobal('location', { pathname: '/test-page' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('sends beacon with correct payload shape', async () => {
    const { trackEvent } = await import('./analytics');
    trackEvent('cta_click', 'test_button', { foo: 'bar' });

    expect(sendBeaconSpy).toHaveBeenCalledOnce();
    const [url, blob] = sendBeaconSpy.mock.calls[0];
    expect(url).toBe('/api/events');

    const text = await (blob as Blob).text();
    const payload = JSON.parse(text);
    expect(payload).toMatchObject({
      event_type: 'cta_click',
      event_name: 'test_button',
      properties: { foo: 'bar' },
      page_path: '/test-page',
    });
    expect(payload.session_id).toBeTruthy();
  });

  it('generates and caches session ID', async () => {
    const { trackEvent } = await import('./analytics');
    trackEvent('cta_click', 'a', {});
    trackEvent('cta_click', 'b', {});

    const text1 = await (sendBeaconSpy.mock.calls[0][1] as Blob).text();
    const text2 = await (sendBeaconSpy.mock.calls[1][1] as Blob).text();
    const id1 = JSON.parse(text1).session_id;
    const id2 = JSON.parse(text2).session_id;
    expect(id1).toBe(id2);
  });

  it('restores session ID from sessionStorage', async () => {
    sessionStorageMock['ep_session_id'] = 'existing-session-abc';
    const { trackEvent } = await import('./analytics');
    trackEvent('layer_toggle', 'tempest', {});

    const text = await (sendBeaconSpy.mock.calls[0][1] as Blob).text();
    expect(JSON.parse(text).session_id).toBe('existing-session-abc');
  });

  it('sends empty properties by default', async () => {
    const { trackEvent } = await import('./analytics');
    trackEvent('form_submit', 'newsletter', {});

    const text = await (sendBeaconSpy.mock.calls[0][1] as Blob).text();
    expect(JSON.parse(text).properties).toEqual({});
  });
});
