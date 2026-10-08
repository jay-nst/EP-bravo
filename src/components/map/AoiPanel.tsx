'use client';

import { Button } from '@naraspace-technology/nds/components';
import type { SatelliteType } from '@/types/database';
import { SATELLITE_CONFIG } from '@/constants/satellite';
import { fmtNum } from '@/lib/format';

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
      <h2 className="text-heading-lg text-text-primary">영상 구매</h2>

      {/* Satellite selector */}
      <div>
        <label className="mb-8 block text-body-sm-medium text-text-secondary">위성 선택</label>
        <div className="flex gap-8">
          {(Object.keys(SATELLITE_CONFIG) as SatelliteType[]).map((key) => (
            <Button
              key={key}
              variant="outline"
              active={satellite === key}
              aria-pressed={satellite === key}
              onClick={() => onSatelliteChange(key)}
              className="flex-1"
            >
              {SATELLITE_CONFIG[key].name}
            </Button>
          ))}
        </div>
      </div>

      {/* Satellite info */}
      <div className="rounded-md bg-bg-secondary p-12 text-body-sm-regular text-text-secondary">
        <div className="flex justify-between">
          <span>해상도</span>
          <span className="text-body-sm-medium text-text-primary">{config.resolution}</span>
        </div>
        <div className="mt-4 flex justify-between">
          <span>초해상도</span>
          <span className="text-body-sm-medium text-text-primary">{config.supersolution}</span>
        </div>
        <div className="mt-4 flex justify-between">
          <span>가격</span>
          <span className="text-body-sm-medium text-text-primary tabular-nums">
            ${config.pricePerKm2}/km²
          </span>
        </div>
        <div className="mt-4 flex justify-between">
          <span>최소 면적</span>
          <span className="text-body-sm-medium text-text-primary tabular-nums">
            {config.minAreaKm2}km²
          </span>
        </div>
      </div>

      {/* AOI info */}
      {!aoi ? (
        <div className="py-24 text-center text-body-sm-regular text-text-secondary">
          지도에서 다각형 도구로
          <br />
          관심 영역(AOI)을 그려주세요
        </div>
      ) : (
        <>
          <div className="rounded-md bg-bg-secondary p-12 text-body-sm-regular">
            <div className="flex justify-between text-text-secondary">
              <span>선택 면적</span>
              <span className="text-body-sm-medium text-text-primary tabular-nums">
                {fmtNum(aoi.areaKm2, 1)} km²
              </span>
            </div>
            <div className="mt-8 flex justify-between text-body-md-medium text-text-primary">
              <span>예상 가격</span>
              <span className="tabular-nums">
                ${fmtNum(aoi.price, 2)}
              </span>
            </div>
          </div>

          {aoi.validationError && (
            <div className="rounded-md bg-status-danger-subtle p-12 text-body-sm-regular text-status-danger">
              {aoi.validationError}
            </div>
          )}

          {!hasCatalogItem && !aoi.validationError && (
            <div className="rounded-md bg-status-warning-subtle p-12 text-body-sm-regular text-status-warning">
              이 영역에 사용 가능한 영상이 없습니다. 지도를 이동하여 영상이 있는
              영역을 선택해주세요.
            </div>
          )}

          <Button
            display="block"
            onClick={onPurchase}
            disabled={!canPurchase}
            loading={purchasing}
          >
            {purchasing
              ? '결제 진행 중...'
              : aoi.validationError
                ? 'AOI 조건 미충족'
                : !hasCatalogItem
                  ? '영상 없음'
                  : '구매하기'}
          </Button>
        </>
      )}
    </>
  );

  if (bare) return content;

  return (
    <div className="glass-panel flex w-320 flex-col gap-16 overflow-y-auto border-l border-border-tertiary p-16">
      {content}
    </div>
  );
}
