import { NextResponse } from 'next/server';
import { MOCK_DASHBOARD_SUMMARY } from '@/lib/mock-dashboard';

export async function GET() {
  return NextResponse.json(MOCK_DASHBOARD_SUMMARY);
}
