import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO_USER } from '@/lib/demo-user';

const taskingSchema = z.object({
  aoi: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
  preferredDateFrom: z.string().optional(),
  preferredDateTo: z.string().optional(),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

// GET: List user's tasking requests
export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? DEMO_USER.id;

  const { data: requests, error } = await supabase
    .from('tasking_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: '요청 목록 조회 실패' },
      { status: 500 },
    );
  }

  return NextResponse.json({ requests });
}

// POST: Create a new tasking request
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? DEMO_USER.id;

  const body = await request.json();
  const parsed = taskingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: '잘못된 요청', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { aoi, preferredDateFrom, preferredDateTo, contactEmail, contactPhone, notes } = parsed.data;
  const admin = createAdminClient();

  const { data: req, error } = await admin
    .from('tasking_requests')
    .insert({
      user_id: userId,
      aoi: JSON.stringify(aoi),
      preferred_date_from: preferredDateFrom || null,
      preferred_date_to: preferredDateTo || null,
      contact_email: contactEmail,
      contact_phone: contactPhone || null,
      notes: notes || null,
    })
    .select()
    .single();

  if (error || !req) {
    return NextResponse.json(
      { error: '촬영 요청 생성 실패' },
      { status: 500 },
    );
  }

  return NextResponse.json({ request: req }, { status: 201 });
}
