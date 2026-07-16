import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { DashboardSummary } from '@/types/dashboard';
import { MOCK_DASHBOARD_SUMMARY } from '@/lib/mock-dashboard';

export async function GET() {
  const supabase = await createClient();

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    /* auth may fail in dev */
  }

  // Editor's pick: latest feed item with type 'northpaper' or 'analysis'
  const { data: editorPick, error: editorError } = await supabase
    .from('feed_items')
    .select('*')
    .in('type', ['northpaper', 'analysis'])
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  if (editorError && editorError.code !== 'PGRST116') {
    return NextResponse.json(MOCK_DASHBOARD_SUMMARY);
  }

  // Daily scene: latest catalog item
  const { data: latestScene } = await supabase
    .from('imagery_catalog')
    .select('id, satellite, acquired_at, resolution, thumbnail_url, metadata')
    .order('acquired_at', { ascending: false })
    .limit(1)
    .single();

  const summary: DashboardSummary = {
    dailyScene: latestScene
      ? {
          id: latestScene.id,
          satellite: latestScene.satellite,
          location: (latestScene.metadata as Record<string, string>)?.location ?? '',
          acquired_at: latestScene.acquired_at,
          resolution: latestScene.resolution,
          thumbnail_url: latestScene.thumbnail_url,
        }
      : null,
    editorPick: editorPick
      ? {
          id: editorPick.id,
          tag: editorPick.type,
          title: editorPick.title,
          description: editorPick.description ?? '',
          link_url: editorPick.link_url ?? '',
          published_at: editorPick.published_at,
          source: (editorPick.metadata as Record<string, string>)?.source ?? 'EarthPaper',
        }
      : null,
    recentOrders: [],
    stats: {
      totalImages: 0,
      totalAreaKm2: 0,
      memberSince: '',
    },
    watchlist: [],
    pendingTaskings: 0,
  };

  // Authenticated user: fetch personalized data
  if (user) {
    const [ordersResult, profileResult, watchlistResult, taskingResult] = await Promise.all([
      supabase
        .from('orders')
        .select('id, status, aoi_area_km2, total_price, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single(),
      supabase
        .from('watchlist_areas')
        .select('id, name, geometry, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('tasking_requests')
        .select('id', { count: 'exact', head: true })
        .in('status', ['received', 'reviewing']),
    ]);

    summary.recentOrders = (ordersResult.data ?? []).map((o) => ({
      id: o.id,
      status: o.status,
      aoi_area_km2: Number(o.aoi_area_km2),
      total_price: Number(o.total_price),
      created_at: o.created_at,
    }));

    if (profileResult.data) {
      const completedOrders = summary.recentOrders.filter((o) => o.status === 'completed');
      summary.stats = {
        totalImages: completedOrders.length,
        totalAreaKm2: completedOrders.reduce((sum, o) => sum + o.aoi_area_km2, 0),
        memberSince: profileResult.data.created_at,
      };
    }

    summary.watchlist = (watchlistResult.data ?? []).map((w) => ({
      id: w.id,
      name: w.name,
      geometry: w.geometry,
      new_images_count: 0,
      created_at: w.created_at,
    }));

    summary.pendingTaskings = taskingResult.count ?? 0;
  }

  return NextResponse.json(summary);
}
