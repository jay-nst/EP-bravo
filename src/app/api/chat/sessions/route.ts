import { NextResponse } from 'next/server';

const MOCK_SESSIONS = [
  {
    id: 'sess-001',
    title: '한반도 위성 해상도 비교',
    updated_at: '2026-07-04T15:30:00Z',
  },
  {
    id: 'sess-002',
    title: 'SpaceEye-T 촬영 요금 문의',
    updated_at: '2026-07-01T10:00:00Z',
  },
];

export async function GET() {
  return NextResponse.json({ sessions: MOCK_SESSIONS });
}

export async function POST() {
  return NextResponse.json({
    session: {
      id: `sess-${Date.now()}`,
      title: '새 대화',
      updated_at: new Date().toISOString(),
    },
  });
}
