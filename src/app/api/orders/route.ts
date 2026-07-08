import { NextResponse } from 'next/server';

const MOCK_ORDERS = [
  {
    id: 'a1b2c3d4-1111-2222-3333-444455556666',
    catalog_item_id: 'cat-001',
    aoi_area_km2: 25.4,
    status: 'completed',
    total_price: 304.8,
    clip_result_url: null,
    error_message: null,
    created_at: '2026-06-28T09:15:00Z',
    payments: [{ status: 'paid', amount: 304.8 }],
    downloads: [
      {
        id: 'dl-001',
        file_url: '/mock/download',
        expires_at: '2026-08-28T09:15:00Z',
        downloaded: false,
      },
    ],
  },
  {
    id: 'b2c3d4e5-2222-3333-4444-555566667777',
    catalog_item_id: 'cat-002',
    aoi_area_km2: 12.8,
    status: 'processing',
    total_price: 153.6,
    clip_result_url: null,
    error_message: null,
    created_at: '2026-07-02T14:30:00Z',
    payments: [{ status: 'paid', amount: 153.6 }],
    downloads: [],
  },
  {
    id: 'c3d4e5f6-3333-4444-5555-666677778888',
    catalog_item_id: 'cat-003',
    aoi_area_km2: 8.2,
    status: 'pending',
    total_price: 98.4,
    clip_result_url: null,
    error_message: null,
    created_at: '2026-07-05T11:00:00Z',
    payments: [],
    downloads: [],
  },
];

export async function GET() {
  return NextResponse.json({ orders: MOCK_ORDERS });
}
