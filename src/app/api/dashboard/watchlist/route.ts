import { NextRequest, NextResponse } from 'next/server';
import { MOCK_WATCHLIST } from '@/lib/mock-dashboard';
import { badRequest } from '@/lib/api-error';

export async function GET() {
  return NextResponse.json({ areas: MOCK_WATCHLIST });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, geometry } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return badRequest('관심지역 이름을 입력해주세요');
  }
  if (name.length > 50) {
    return badRequest('이름은 50자 이하로 입력해주세요');
  }
  if (!geometry || geometry.type !== 'Polygon') {
    return badRequest('유효한 Polygon geometry가 필요합니다');
  }

  const newArea = {
    id: `wl-${Date.now()}`,
    name: name.trim(),
  };

  return NextResponse.json(newArea, { status: 201 });
}
