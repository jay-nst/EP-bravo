import { describe, it, expect } from 'vitest';
import { MOCK_FEED_ITEMS, MOCK_DASHBOARD_SUMMARY } from '@/lib/mock-dashboard';
import type { FeedType } from '@/types/dashboard';

const VALID_TYPES: FeedType[] = [
  'analysis', 'shorts', 'trending', 'news', 'community', 'report',
  'citadel', 'predict', 'warden', 'northpaper',
];

describe('MOCK_FEED_ITEMS', () => {
  it('has items', () => {
    expect(MOCK_FEED_ITEMS.length).toBeGreaterThan(0);
  });

  it('all items have unique ids', () => {
    const ids = MOCK_FEED_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all items have valid type', () => {
    for (const item of MOCK_FEED_ITEMS) {
      expect(VALID_TYPES).toContain(item.type);
    }
  });

  it('all items have valid published_at dates', () => {
    for (const item of MOCK_FEED_ITEMS) {
      const d = new Date(item.published_at);
      expect(d.getTime()).not.toBeNaN();
    }
  });

  it('external links use Korean ep.naraspace.com', () => {
    for (const item of MOCK_FEED_ITEMS) {
      if (item.link_url?.includes('ep.naraspace.com')) {
        expect(item.link_url).toContain('/ko/');
        expect(item.link_action).toBe('external');
      }
    }
  });

  it('YouTube shorts have valid youtube_id', () => {
    const shorts = MOCK_FEED_ITEMS.filter((i) => i.type === 'shorts');
    expect(shorts.length).toBeGreaterThanOrEqual(5);
    for (const s of shorts) {
      expect(s.metadata.youtube_id).toBeTruthy();
      expect(typeof s.metadata.youtube_id).toBe('string');
      expect(s.link_url).toContain('youtube.com/shorts/');
    }
  });

  it('all platform types have at least one item', () => {
    for (const t of ['citadel', 'predict', 'warden', 'northpaper'] as FeedType[]) {
      const items = MOCK_FEED_ITEMS.filter((i) => i.type === t);
      expect(items.length).toBeGreaterThan(0);
    }
  });
});

describe('MOCK_DASHBOARD_SUMMARY', () => {
  it('has editorPick with valid link', () => {
    expect(MOCK_DASHBOARD_SUMMARY.editorPick).toBeTruthy();
    expect(MOCK_DASHBOARD_SUMMARY.editorPick!.link_url).toBeTruthy();
  });

  it('has stats', () => {
    expect(MOCK_DASHBOARD_SUMMARY.stats.totalImages).toBeGreaterThan(0);
    expect(MOCK_DASHBOARD_SUMMARY.stats.totalAreaKm2).toBeGreaterThan(0);
  });
});
