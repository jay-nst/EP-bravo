import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { badRequest, serverError } from '@/lib/api-error';

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
    return badRequest('Invalid parameters', parsed.error.flatten());
  }

  const { west, south, east, north, satellite, maxCloudCover, limit } =
    parsed.data;

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('search_catalog_by_bbox', {
    p_west: west,
    p_south: south,
    p_east: east,
    p_north: north,
    p_satellite: satellite ?? null,
    p_max_cloud_cover: maxCloudCover ?? null,
    p_limit: limit,
  });

  if (error) {
    return serverError('Database query failed', error.message);
  }

  return NextResponse.json({ items: data ?? [], count: data?.length ?? 0 });
}
