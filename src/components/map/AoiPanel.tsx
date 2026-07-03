'use client';

import type { SatelliteType } from '@/types/database';
import { SATELLITE_CONFIG } from '@/constants/satellite';

interface AoiSelection {
  polygon: GeoJSON.Polygon;
  areaKm2: number;
  price: number;
  satellite: SatelliteType;
  validationError: string | null;
}

interface AoiPanelProps {
  aoi: AoiSelection | null;
  satellite: SatelliteType;
  onSatelliteChange: (sat: SatelliteType) => void;
  onPurchase: () => void;
  purchasing?: boolean;
  hasCatalogItem?: boolean;
  bare?: boolean;
}

export default function AoiPanel({
  aoi,
  satellite,
  onSatelliteChange,
  onPurchase,
  purchasing = false,
  hasCatalogItem = false,
  bare = false,
}: AoiPanelProps) {
  const config = SATELLITE_CONFIG[satellite];
  const canPurchase = aoi && !aoi.validationError && hasCatalogItem && !purchasing;

  const content = (
    <>
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
        영상 구매
      </h2>

      {/* Satellite selector */}
      <div>
        <label
          className="block text-sm font-medium mb-1"
          style={{ color: 'var(--text-muted)' }}
        >
          위성 선택
        </label>
        <div className="flex gap-2">
          {(Object.keys(SATELLITE_CONFIG) as SatelliteType[]).map((key) => (
            <button
              key={key}
              onClick={() => onSatelliteChange(key)}
              className="flex-1 px-3 py-2 text-sm rounded-md border transition-colors"
              style={{
                background: satellite === key ? 'var(--accent)' : 'var(--surface)',
                color: satellite === key ? '#0E0E10' : 'var(--text)',
                borderColor: satellite === key ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {SATELLITE_CONFIG[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Satellite info */}
      <div
        className="rounded-md p-3 text-sm"
        style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
      >
        <div className="flex justify-between">
          <span>해상도</span>
          <span className="font-medium" style={{ color: 'var(--text)' }}>
            {config.resolution}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span>초해상도</span>
          <span className="font-medium" style={{ color: 'var(--text)' }}>
            {config.supersolution}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span>가격</span>
          <span className="font-medium font-mono" style={{ color: 'var(--text)' }}>
            ${config.pricePerKm2}/km²
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span>최소 면적</span>
          <span className="font-medium font-mono" style={{ color: 'var(--text)' }}>
            {config.minAreaKm2}km²
          </span>
        </div>
      </div>

      {/* AOI info */}
      {!aoi ? (
        <div
          className="text-sm text-center py-6"
          style={{ color: 'var(--text-muted)' }}
        >
          지도에서 다각형 도구로
          <br />
          관심 영역(AOI)을 그려주세요
        </div>
      ) : (
        <>
          <div
            className="rounded-md p-3 text-sm"
            style={{ background: 'var(--surface)' }}
          >
            <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
              <span>선택 면적</span>
              <span className="font-medium font-mono" style={{ color: 'var(--text)' }}>
                {aoi.areaKm2} km²
              </span>
            </div>
            <div
              className="flex justify-between mt-2 text-base font-semibold"
              style={{ color: 'var(--text)' }}
            >
              <span>예상 가격</span>
              <span className="font-mono" style={{ color: 'var(--accent)' }}>
                ${aoi.price.toLocaleString()}
              </span>
            </div>
          </div>

          {aoi.validationError && (
            <div
              className="rounded-md p-3 text-sm"
              style={{
                background: 'rgba(196, 92, 74, 0.1)',
                border: '1px solid rgba(196, 92, 74, 0.2)',
                color: 'var(--error)',
              }}
            >
              {aoi.validationError}
            </div>
          )}

          {!hasCatalogItem && !aoi.validationError && (
            <div
              className="rounded-md p-3 text-sm"
              style={{
                background: 'rgba(200, 146, 58, 0.1)',
                border: '1px solid rgba(200, 146, 58, 0.2)',
                color: 'var(--warning)',
              }}
            >
              이 영역에 사용 가능한 영상이 없습니다. 지도를 이동하여 영상이 있는
              영역을 선택해주세요.
            </div>
          )}

          <button
            onClick={onPurchase}
            disabled={!canPurchase}
            className="w-full py-3 rounded-md text-sm font-medium transition-colors"
            style={{
              background: canPurchase ? 'var(--accent)' : 'var(--surface)',
              color: canPurchase ? '#0E0E10' : 'var(--text-muted)',
              cursor: canPurchase ? 'pointer' : 'not-allowed',
            }}
          >
            {purchasing
              ? '결제 진행 중...'
              : aoi.validationError
                ? 'AOI 조건 미충족'
                : !hasCatalogItem
                  ? '영상 없음'
                  : '구매하기'}
          </button>
        </>
      )}
    </>
  );

  if (bare) return content;

  return (
    <div
      className="w-80 glass-panel border-l flex flex-col gap-4 overflow-y-auto p-4"
      style={{ borderColor: 'var(--border)' }}
    >
      {content}
    </div>
  );
}
