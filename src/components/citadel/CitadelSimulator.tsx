'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type mapboxgl from 'mapbox-gl';
import { Button, Separator, Spinner } from '@naraspace-technology/nds/components';
import { addCitadelOverlay, removeSimulatorOverlay } from '@/lib/simulator-overlays';
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

interface DisasterResult {
  areaKm2: number;
  affectedAreaKm2: number;
  affectedPct: number;
  burnedAreaKm2: number;
  damagedBuildings: number;
  ndviDrop: number;
  severityLevel: 'low' | 'moderate' | 'high';
  estimatedRecoveryMonths: number;
  lastObservation: string;
}

function generateDisaster(areaKm2: number): DisasterResult {
  const seed = Math.round(areaKm2 * 100) % 100;
  const affectedRatio = 0.3 + (seed % 30) * 0.01;
  const affectedArea = areaKm2 * affectedRatio;
  const burnedRatio = 0.6 + (seed % 20) * 0.01;
  const ndviDrop = 35 + (seed % 25);
  const severity: DisasterResult['severityLevel'] =
    ndviDrop > 50 ? 'high' : ndviDrop > 40 ? 'moderate' : 'low';

  return {
    areaKm2,
    affectedAreaKm2: affectedArea,
    affectedPct: affectedRatio * 100,
    burnedAreaKm2: affectedArea * burnedRatio,
    damagedBuildings: Math.max(3, Math.floor(areaKm2 * 12)),
    ndviDrop,
    severityLevel: severity,
    estimatedRecoveryMonths: severity === 'high' ? 24 : severity === 'moderate' ? 12 : 6,
    lastObservation: '2026. 07. 13.',
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

const SEVERITY_TONE: Record<DisasterResult['severityLevel'], Tone> = {
  low: 'success',
  moderate: 'warning',
  high: 'danger',
};

const SEVERITY_LABELS = {
  low: '경미',
  moderate: '보통',
  high: '심각',
};

export default function CitadelSimulator() {
  const [phase, setPhase] = useState<Phase>('draw');
  const [result, setResult] = useState<DisasterResult | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const polyRef = useRef<GeoJSON.Polygon | null>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current) {
      trackEvent('simulator_event', 'simulator_viewed', { vertical: 'citadel' });
      trackedRef.current = true;
    }
  }, []);

  const handleMapReady = useCallback((m: mapboxgl.Map) => {
    mapRef.current = m;
  }, []);

  const clearOverlay = useCallback(() => {
    if (mapRef.current) removeSimulatorOverlay(mapRef.current, 'citadel');
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
      trackEvent('simulator_event', 'aoi_drawn', { vertical: 'citadel', areaKm2: aoi.areaKm2 });
      setTimeout(() => {
        const r = generateDisaster(aoi.areaKm2);
        setResult(r);
        setPhase('result');
        trackEvent('simulator_event', 'result_viewed', { vertical: 'citadel' });
        if (mapRef.current && polyRef.current) {
          addCitadelOverlay(mapRef.current, polyRef.current, r);
        }
      }, 1800);
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
        <h2 className="text-heading-2xl text-text-primary">재난 피해 분석 체험</h2>
      </div>

      {/* 지도 캔버스가 컨테이너를 꽉 채워 inset-ring 을 가리므로 지도 프레임만 border 로 그린다 */}
      <div className="relative h-320 overflow-hidden rounded-sm border border-border-tertiary md:h-480">
        <EarthMap
          onAoiChange={handleAoiChange}
          onMapReady={handleMapReady}
          initialStyle="satellite"
          center={[127.7, 34.95]}
          zoom={11}
        />

        <div className="pointer-events-auto absolute bottom-0 left-0 right-0 max-h-[75%] overflow-y-auto rounded-t-lg bg-panel-bg backdrop-blur-[12px] inset-ring-1 inset-ring-border-tertiary md:bottom-auto md:left-auto md:right-12 md:top-12 md:max-h-[calc(100%-24px)] md:w-280 md:rounded-lg">
          {phase === 'draw' && (
            <div className="p-16 md:p-20">
              <h3 className="mb-8 text-heading-lg text-text-primary">재난 피해 분석</h3>
              <p className="mb-16 text-body-sm-regular text-text-secondary">
                피해 지역을 그려보세요. NDVI/dNBR 기반 피해 범위와 심각도가
                시뮬레이션됩니다.
              </p>
              <div className="rounded-md bg-bg-secondary px-12 py-8 text-body-sm-regular text-text-secondary">
                왼쪽 상단 도구로 피해 지역을 그리세요
              </div>
            </div>
          )}

          {phase === 'analyzing' && (
            <div className="flex flex-col items-center gap-12 p-16 text-center md:p-20">
              <Spinner />
              <p className="text-body-sm-regular text-text-secondary">NDVI / dNBR 분석 중...</p>
            </div>
          )}

          {phase === 'result' && result && (
            <div>
              <div className="flex items-center justify-between py-8 pl-16 pr-8">
                <h3 className="text-heading-lg text-text-primary">피해 분석 결과</h3>
                <Button variant="text" size="sm" onClick={handleReset}>
                  초기화
                </Button>
              </div>
              <Separator />

              <div className="relative h-100 overflow-hidden">
                <img
                  src="https://earthpaper.s3.ap-northeast-2.amazonaws.com/post/v2/editor/33/Thumbnail-2026-gwangyang-wildfire-ndmi-dnbr-analysis.png"
                  alt="재난 피해 분석 위성영상"
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-bg-secondary to-transparent to-60%" />
              </div>

              <div className="p-16">
                {([
                  { label: '분석 면적', value: `${fmtNum(result.areaKm2, 1)} km²` },
                  { label: '피해 면적', value: `${fmtNum(result.affectedAreaKm2, 1)} km² (${fmtNum(result.affectedPct, 0)}%)`, tone: 'warning' },
                  { label: '소실 면적', value: `${fmtNum(result.burnedAreaKm2, 2)} km²`, tone: 'danger' },
                  { label: '피해 건물', value: `${fmtNum(result.damagedBuildings)}동`, tone: 'danger' },
                  { label: 'NDVI 감소', value: `${result.ndviDrop}%` },
                  { label: '심각도', value: SEVERITY_LABELS[result.severityLevel], tone: SEVERITY_TONE[result.severityLevel] },
                  { label: '회복 예상', value: `${result.estimatedRecoveryMonths}개월` },
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
                  onClick={() => { trackEvent('simulator_event', 'lead_form_opened', { vertical: 'citadel' }); setShowLeadForm(true); }}
                >
                  SLA 리포트 요청
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-12 text-body-xs-regular text-text-tertiary">
        시뮬레이션 데이터입니다. 실 서비스에서는 다중 위성영상 기반으로 분석됩니다.
      </p>

      <LeadCaptureModal
        open={showLeadForm}
        onClose={() => setShowLeadForm(false)}
        vertical="citadel"
        accentColor="#C45C4A"
      />
    </section>
  );
}
