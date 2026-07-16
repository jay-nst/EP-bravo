import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { badRequest, serverError } from '@/lib/api-error';

const VALID_EVENT_TYPES = new Set([
  'cta_click',
  'page_view',
  'layer_toggle',
  'map_style_change',
  'form_submit',
  'simulator_event',
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.event_type || !body.event_name) {
      return badRequest('event_type과 event_name은 필수입니다');
    }

    if (!VALID_EVENT_TYPES.has(body.event_type)) {
      return badRequest('유효하지 않은 event_type입니다');
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('analytics_events').insert({
      user_id: user?.id ?? null,
      event_type: body.event_type,
      event_name: body.event_name,
      properties: body.properties ?? {},
      page_path: body.page_path ?? null,
      session_id: body.session_id ?? null,
    });

    if (error) {
      console.error('Event insert error:', error.message);
      return serverError('이벤트 저장 실패');
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return badRequest('잘못된 요청입니다');
  }
}
