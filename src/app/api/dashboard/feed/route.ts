import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { FeedItem, FeedType } from '@/types/dashboard';
import { badRequest } from '@/lib/api-error';
import { MOCK_FEED_ITEMS } from '@/lib/mock-dashboard';

const VALID_TYPES = new Set<string>(['all', 'analysis', 'shorts', 'trending', 'news', 'community', 'report', 'citadel', 'predict', 'warden', 'northpaper']);

function filterMock(type: string, limit: number, cursor: string | null): { items: FeedItem[]; nextCursor: string | null } {
  let filtered = type === 'all' ? MOCK_FEED_ITEMS : MOCK_FEED_ITEMS.filter((i) => i.type === type);
  filtered = filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  if (cursor) {
    filtered = filtered.filter((i) => new Date(i.published_at).getTime() < new Date(cursor).getTime());
  }
  const page = filtered.slice(0, limit);
  const nextCursor = page.length === limit ? page[page.length - 1].published_at : null;
  return { items: page, nextCursor };
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') ?? 'all';
  const cursor = searchParams.get('cursor');
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 10), 1), 50);

  if (!VALID_TYPES.has(type)) {
    return badRequest('유효하지 않은 피드 타입입니다');
  }

  const supabase = await createClient();

  let query = supabase
    .from('feed_items')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (type !== 'all') {
    query = query.eq('type', type as FeedType);
  }

  if (cursor) {
    query = query.lt('published_at', cursor);
  }

  const { data: items, error } = await query;

  if (error) {
    const mock = filterMock(type, limit, cursor);
    return NextResponse.json(mock);
  }

  const page = items ?? [];
  const nextCursor = page.length === limit ? page[page.length - 1].published_at : null;

  return NextResponse.json({ items: page, nextCursor });
}
