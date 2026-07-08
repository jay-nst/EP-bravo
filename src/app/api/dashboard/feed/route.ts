import { NextRequest, NextResponse } from 'next/server';
import { MOCK_FEED_ITEMS } from '@/lib/mock-dashboard';
import type { FeedType } from '@/types/dashboard';

const VALID_TYPES = new Set<string>(['all', 'analysis', 'shorts', 'trending', 'news', 'community', 'report', 'citadel']);

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') ?? 'all';
  const cursor = searchParams.get('cursor');
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 10), 1), 20);

  if (!VALID_TYPES.has(type)) {
    return NextResponse.json({ error: '유효하지 않은 피드 타입입니다' }, { status: 400 });
  }

  let items = [...MOCK_FEED_ITEMS];

  if (type !== 'all') {
    items = items.filter((item) => item.type === (type as FeedType));
  }

  items.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  if (cursor) {
    const cursorTime = new Date(cursor).getTime();
    items = items.filter((item) => new Date(item.published_at).getTime() < cursorTime);
  }

  const page = items.slice(0, limit);
  const nextCursor = page.length === limit ? page[page.length - 1].published_at : null;

  return NextResponse.json({ items: page, nextCursor });
}
