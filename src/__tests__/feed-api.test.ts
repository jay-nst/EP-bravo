import { describe, it, expect } from 'vitest';
import { MOCK_FEED_ITEMS } from '@/lib/mock-dashboard';

function simulateFeedAPI(params: { type?: string; cursor?: string; limit?: number }) {
  const type = params.type ?? 'all';
  const limit = Math.min(Math.max(params.limit ?? 10, 1), 50);

  let items = [...MOCK_FEED_ITEMS];

  if (type !== 'all') {
    items = items.filter((item) => item.type === type);
  }

  items.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  if (params.cursor) {
    const cursorTime = new Date(params.cursor).getTime();
    items = items.filter((item) => new Date(item.published_at).getTime() < cursorTime);
  }

  const page = items.slice(0, limit);
  const nextCursor = page.length === limit ? page[page.length - 1].published_at : null;

  return { items: page, nextCursor };
}

describe('Feed API logic', () => {
  it('returns all items when type=all', () => {
    const result = simulateFeedAPI({ type: 'all', limit: 50 });
    expect(result.items.length).toBe(MOCK_FEED_ITEMS.length);
  });

  it('filters by type', () => {
    const result = simulateFeedAPI({ type: 'shorts', limit: 50 });
    expect(result.items.length).toBeGreaterThan(0);
    for (const item of result.items) {
      expect(item.type).toBe('shorts');
    }
  });

  it('sorts by published_at descending', () => {
    const result = simulateFeedAPI({ type: 'all', limit: 50 });
    for (let i = 1; i < result.items.length; i++) {
      const prev = new Date(result.items[i - 1].published_at).getTime();
      const curr = new Date(result.items[i].published_at).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  it('respects limit', () => {
    const result = simulateFeedAPI({ type: 'all', limit: 3 });
    expect(result.items.length).toBe(3);
    expect(result.nextCursor).toBeTruthy();
  });

  it('cursor-based pagination works', () => {
    const page1 = simulateFeedAPI({ type: 'all', limit: 5 });
    expect(page1.nextCursor).toBeTruthy();

    const page2 = simulateFeedAPI({ type: 'all', limit: 5, cursor: page1.nextCursor! });
    expect(page2.items.length).toBeGreaterThan(0);

    const page1Ids = new Set(page1.items.map((i) => i.id));
    for (const item of page2.items) {
      expect(page1Ids.has(item.id)).toBe(false);
    }
  });

  it('clamps limit to max 50', () => {
    const result = simulateFeedAPI({ type: 'all', limit: 100 });
    expect(result.items.length).toBeLessThanOrEqual(50);
  });

  it('clamps limit to min 1', () => {
    const result = simulateFeedAPI({ type: 'all', limit: 0 });
    expect(result.items.length).toBe(1);
  });
});
