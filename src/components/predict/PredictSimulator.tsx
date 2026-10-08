'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type mapboxgl from 'mapbox-gl';
import { Button, Separator, Spinner } from '@naraspace-technology/nds/components';
import { addPredictOverlay, removeSimulatorOverlay } from '@/lib/simulator-overlays';
import { trackEvent } from '@/lib/analytics';
import { fmtNum } from '@/lib/format';
import LeadCaptureModal from '@/components/shared/LeadCaptureModal';

const EarthMap = dynamic(() => import('@/components/map/EarthMap'), {
  ssr: false,
  loading: () => (
    <div className="flex size-full items-center justify-center bg-bg-tertiary">
      <p className="text-body-sm-regular text-text-secondary">지도 로딩 중...</p>
    </div>
  ),
});

interface VerificationResult {
  areaKm2: number;
  assetType: string;
  estimatedCapacityMW: number;
  panelCoverage: number;
  constructionProgress: number;
  vegetationIntrusion: number;
  intrusionZones: number;
  status: 'verified' | 'warning';
  lastObservation: string;
}

function generateVerification(areaKm2: number): VerificationResult {
  const seed = Math.round(areaKm2 * 100) % 100;
  const capacityPerKm2 = 40 + (seed % 20);
  const panelCoverage = 0.72 + (seed % 15) * 0.01;
  const intrusionZones = seed % 4;

  return {
    areaKm2,
    assetType: '태양광 발전소',
    estimatedCapacityMW: Math.round(areaKm2 * capacityPerKm2),
    panelCoverage: panelCoverage * 100,
    constructionProgress: 100,
    vegetationIntrusion: intrusionZones > 0 ? 2 + (seed % 3) : 0,
    intrusionZones,
    status: intrusionZones > 2 ? 'warning' : 'verified',
    lastObservation: '2026. 07. 12.',
  };
}

type Phase = 'draw' | 'analyzing' | 'result';

// 결과 값의 의미 색 → NDS 상태 텍스트 토큰 (플랫폼 hex 를 글자색으로 쓰지 않는다)
type Tone = 'danger' | 'warning' | 'success';

const TONE_CLASS: Record<Tone, string> = {
  danger: 'text-status-danger',
  warning: 'text-status-warning',
  success: 'text-status-success',
};

interface ResultRow {
  label: string;
  value: string;
  tone?: Tone;
}

export default function PredictSimulator() {
  const [phase, setPhase] = useState<Phase>('draw');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const polyRef = useRef<GeoJSON.Polygon | null>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current) {
      trackEvent('simulator_event', 'simulator_viewed', { vertical: 'predict' });
      trackedRef.current = true;
    }
  }, []);

  const handleMapReady = useCallback((m: mapboxgl.Map) => {
    mapRef.current = m;
  }, []);

  const clearOverlay = useCallback(() => {
    if (mapRef.current) removeSimulatorOverlay(mapRef.current, 'predict');
  }, []);

  const handleAoiChange = useCallback(
    (aoi: { areaKm2: number; polygon: GeoJSON.Polygon } | null) => {
      clearOverlay();
      if (!aoi) {
        setPhase('draw');
        setResult(null);
        polyRef.current = null;
        return;
      }

      polyRef.current = aoi.polygon;
      setPhase('analyzing');
      trackEvent('simulator_event', 'aoi_drawn', { vertical: 'predict', areaKm2: aoi.areaKm2 });
      setTimeout(() => {
        const r = generateVerification(aoi.areaKm2);
        setResult(r);
        setPhase('result');
        trackEvent('simulator_event', 'result_viewed', { vertical: 'predict' });
        if (mapRef.current && polyRef.current) {
          addPredictOverlay(mapRef.current, polyRef.current, r);
        }
      }, 2200);
    },
    [clearOverlay],
  );

  const handleReset = useCallback(() => {
    clearOverlay();
    setPhase('draw');
    setResult(null);
    polyRef.current = null;
  }, [clearOverlay]);

  return (
    <section className="mx-auto max-w-960 px-16 pb-64 sm:px-24">
      <div className="mb-24 flex flex-col items-start gap-8">
        <h2 className="text-heading-2xl text-text-primary">자산 검증 체험</h2>
      </div>

      {/* 지도 캔버스가 컨테이너를 꽉 채워 inset-ring 을 가리므로 지도 프레임만 border 로 그린다 */}
      <div className="relative h-320 overflow-hidden rounded-lg border border-border-tertiary md:h-480">
        <EarthMap
          onAoiChange={handleAoiChange}
          onMapReady={handleMapReady}
          initialStyle="satellite"
          center={[72.0, 27.0]}
          zoom={9}
        />

        <div className="pointer-events-auto absolute bottom-0 left-0 right-0 max-h-[75%] overflow-y-auto rounded-t-lg bg-panel-bg backdrop-blur-[12px] inset-ring-1 inset-ring-border-tertiary md:bottom-auto md:left-auto md:right-12 md:top-12 md:max-h-[calc(100%-24px)] md:w-280 md:rounded-lg">
          {phase === 'draw' && (
            <div className="p-16 md:p-20">
              <h3 className="mb-8 text-heading-lg text-text-primary">자산 검증</h3>
              <p className="mb-16 text-body-sm-regular text-text-secondary">
                태양광 발전소 경계를 그려보세요. 위성영상 기반 자산 존재·상태
                검증이 시뮬레이션됩니다.
              </p>
              <div className="rounded-md bg-bg-secondary px-12 py-8 text-body-sm-regular text-text-secondary">
                왼쪽 상단 도구로 발전소 경계를 그리세요
              </div>
            </div>
          )}

          {phase === 'analyzing' && (
            <div className="flex flex-col items-center gap-12 p-16 text-center md:p-20">
              <Spinner />
              <p className="text-body-sm-regular text-text-secondary">위성영상 분석 중...</p>
            </div>
          )}

          {phase === 'result' && result && (
            <div>
              <div className="flex items-center justify-between py-8 pl-16 pr-8">
                <h3 className="text-heading-lg text-text-primary">검증 결과</h3>
                <Button variant="text" size="sm" onClick={handleReset}>
                  초기화
                </Button>
              </div>
              <Separator />

              <div className="relative h-100 overflow-hidden">
                <img
                  src="https://earthpaper.s3.ap-northeast-2.amazonaws.com/post/v2/editor/28/Thumbnail-corn-belt-yield-model-97pct-accuracy-satellite-forecast.png"
                  alt="자산 검증 위성영상"
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-bg-secondary to-transparent to-60%" />
              </div>

              <div className="p-16">
                {([
                  { label: '검증 면적', value: `${fmtNum(result.areaKm2, 1)} km²` },
                  { label: '자산 유형', value: result.assetType },
                  { label: '추정 용량', value: `${fmtNum(result.estimatedCapacityMW)} MW` },
                  { label: '패널 커버리지', value: `${fmtNum(result.panelCoverage, 0)}%` },
                  { label: '건설 진행률', value: `${result.constructionProgress}%` },
                  {
                    label: '식생 침범',
                    value: result.intrusionZones > 0
                      ? `${result.intrusionZones}개 구역`
                      : '없음',
                    tone: result.intrusionZones > 0 ? 'warning' : 'success',
                  },
                  {
                    label: '검증 상태',
                    value: result.status === 'verified' ? '가동 확인' : '주의 필요',
                    tone: result.status === 'verified' ? 'success' : 'warning',
                  },
                  { label: '마지막 관측', value: result.lastObservation },
                ] satisfies ResultRow[]).map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between border-b border-border-tertiary py-6"
                  >
                    <span className="text-body-xs-regular text-text-tertiary">{item.label}</span>
                    <span className={`text-body-sm-medium tabular-nums ${item.tone ? TONE_CLASS[item.tone] : 'text-text-primary'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}

                <Button
                  display="block"
                  className="mt-16"
                  onClick={() => { trackEvent('simulator_event', 'lead_form_opened', { vertical: 'predict' }); setShowLeadForm(true); }}
                >
                  검증 리포트 요청
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-12 text-body-xs-regular text-text-tertiary">
        시뮬레이션 데이터입니다. 실 서비스에서는 고해상도 위성영상 기반으로
        검증됩니다.
      </p>

      <LeadCaptureModal
        open={showLeadForm}
        onClose={() => setShowLeadForm(false)}
        vertical="predict"
        accentColor="#4A9EC4"
      />
    </section>
  );
}
