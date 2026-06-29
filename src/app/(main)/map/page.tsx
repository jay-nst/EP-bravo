'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import AoiPanel from '@/components/map/AoiPanel';
import type { SatelliteType } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { requestTossPayment } from '@/lib/toss/widget';

const EarthMap = dynamic(() => import('@/components/map/EarthMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <p className="text-white text-sm">지도 로딩 중...</p>
    </div>
  ),
});

interface AoiSelection {
  polygon: GeoJSON.Polygon;
  areaKm2: number;
  price: number;
  satellite: SatelliteType;
  validationError: string | null;
}

export default function MapPage() {
  const [satellite, setSatellite] = useState<SatelliteType>('observer');
  const [aoi, setAoi] = useState<AoiSelection | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [catalogItemId, setCatalogItemId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const handleAoiChange = useCallback((newAoi: AoiSelection | null) => {
    setAoi(newAoi);
  }, []);

  const handleCatalogSelect = useCallback((itemId: string) => {
    setCatalogItemId(itemId);
  }, []);

  const handlePurchase = useCallback(async () => {
    if (!aoi || aoi.validationError || !catalogItemId) return;
    setPurchasing(true);

    try {
      // Step 1: Create order on server
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalogItemId,
          aoi: aoi.polygon,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || '주문 생성 실패');
        setPurchasing(false);
        return;
      }

      const { orderId, amount, orderName } = await res.json();

      // Step 2: Get user email for Toss customerKey
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Step 3: Redirect to Toss payment
      await requestTossPayment({
        orderId,
        amount,
        orderName,
        customerEmail: user?.email || 'anonymous',
      });
    } catch (err) {
      if (err instanceof Error && err.message.includes('canceled')) {
        // User cancelled payment - not an error
      } else {
        alert('결제 처리 중 오류가 발생했습니다');
      }
      setPurchasing(false);
    }
  }, [aoi, catalogItemId, supabase]);

  return (
    <div className="flex" style={{ height: 'calc(100vh - var(--header-height))' }}>
      <div className="flex-1">
        <EarthMap
          onAoiChange={handleAoiChange}
          satellite={satellite}
          onCatalogSelect={handleCatalogSelect}
        />
      </div>
      <AoiPanel
        aoi={aoi}
        satellite={satellite}
        onSatelliteChange={setSatellite}
        onPurchase={handlePurchase}
        purchasing={purchasing}
        hasCatalogItem={!!catalogItemId}
      />
    </div>
  );
}
