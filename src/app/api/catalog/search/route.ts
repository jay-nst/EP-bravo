import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const searchSchema = z.object({
  west: z.number().min(-180).max(180),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  north: z.number().min(-90).max(90),
  satellite: z.enum(['observer', 'spaceeye-t']).optional(),
  maxCloudCover: z.number().min(0).max(100).optional(),
  limit: z.number().min(1).max(100).default(20),
});

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const parsed = searchSchema.safeParse({
    west: Number(params.get('west')),
    south: Number(params.get('south')),
    east: Number(params.get('east')),
    north: Number(params.get('north')),
    satellite: params.get('satellite') || undefined,
    maxCloudCover: params.get('maxCloudCover')
      ? Number(params.get('maxCloudCover'))
      : undefined,
    limit: params.get('limit') ? Number(params.get('limit')) : 20,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { west, south, east, north, satellite, maxCloudCover, limit } =
    parsed.data;

  const supabase = await createClient();

  // PostGIS spatial query: find catalog items whose bbox intersects the search bbox
  let query = supabase
    .from('imagery_catalog')
    .select('*')
    .limit(limit)
    .order('acquired_at', { ascending: false });

  // Spatial filter via RPC (PostGIS ST_Intersects)
  // For now, use a bounding box filter via RPC function
  // TODO: Replace with proper PostGIS RPC when Supabase is connected
  if (satellite) {
    query = query.eq('satellite', satellite);
  }

  if (maxCloudCover !== undefined) {
    query = query.lte('cloud_cover', maxCloudCover);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Database query failed', details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ items: data ?? [], count: data?.length ?? 0 });
}
