'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type mapboxgl from 'mapbox-gl';
import { Button, Separator, Spinner } from '@naraspace-technology/nds/components';
import { addNorthpaperOverlay, removeSimulatorOverlay } from '@/lib/simulator-overlays';
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

interface ChangeDetectionResult {
  areaKm2: number;
  observationCount: number;
  changedZones: number;
  newStructures: number;
  vehicleActivity: string;
  thermalAnomalies: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  assessmentPeriod: string;
  lastObservation: string;
}

function generateChangeDetection(areaKm2: number): ChangeDetectionResult {
  const seed = Math.round(areaKm2 * 100) % 100;
  const changedZones = 2 + (seed % 5);
  const newStructures = seed % 4;
  const thermalAnomalies = 1 + (seed % 3);
  const confidence: ChangeDetectionResult['confidenceLevel'] =
    changedZones > 4 ? 'high' : changedZones > 2 ? 'medium' : 'low';

  return {
    areaKm2,
    observationCount: 12 + (seed % 8),
    changedZones,
    newStructures,
    vehicleActivity: seed % 2 === 0 ? '증가 추세' : '변동 없음',
    thermalAnomalies,
    confidenceLevel: confidence,
    assessmentPeriod: '2025. 01. — 2026. 07.',
    lastObservation: '2026. 07. 11.',
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

const CONFIDENCE_TONE: Record<ChangeDetectionResult['confidenceLevel'], Tone> = {
  high: 'danger',
  medium: 'warning',
  low: 'success',
};

const CONFIDENCE_LABELS = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

export default function NorthpaperSimulator() {
  const [phase, setPhase] = useState<Phase>('draw');
  const [result, setResult] = useState<ChangeDetectionResult | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const polyRef = useRef<GeoJSON.Polygon | null>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current) {
      trackEvent('simulator_event', 'simulator_viewed', { vertical: 'northpaper' });
      trackedRef.current = true;
    }
  }, []);

  const handleMapReady = useCallback((m: mapboxgl.Map) => {
    mapRef.current = m;
  }, []);

  const clearOverlay = useCallback(() => {
    if (mapRef.current) removeSimulatorOverlay(mapRef.current, 'northpaper');
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
      trackEvent('simulator_event', 'aoi_drawn', { vertical: 'northpaper', areaKm2: aoi.areaKm2 });
      setTimeout(() => {
        const r = generateChangeDetection(aoi.areaKm2);
        setResult(r);
        setPhase('result');
        trackEvent('simulator_event', 'result_viewed', { vertical: 'northpaper' });
        if (mapRef.current && polyRef.current) {
          addNorthpaperOverlay(mapRef.current, polyRef.current, r);
        }
      }, 2500);
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
        <h2 className="text-heading-2xl text-text-primary">변화 탐지 체험</h2>
      </div>

      {/* 지도 캔버스가 컨테이너를 꽉 채워 inset-ring 을 가리므로 지도 프레임만 border 로 그린다 */}
      <div className="relative h-320 overflow-hidden rounded-sm border border-border-tertiary md:h-480">
        <EarthMap
          onAoiChange={handleAoiChange}
          onMapReady={handleMapReady}
          initialStyle="satellite"
          center={[126.5, 37.95]}
          zoom={12}
        />

        <div className="pointer-events-auto absolute bottom-0 left-0 right-0 max-h-[75%] overflow-y-auto rounded-t-lg bg-panel-bg backdrop-blur-[12px] inset-ring-1 inset-ring-border-tertiary md:bottom-auto md:left-auto md:right-12 md:top-12 md:max-h-[calc(100%-24px)] md:w-280 md:rounded-lg">
          {phase === 'draw' && (
            <div className="p-16 md:p-20">
              <h3 className="mb-8 text-heading-lg text-text-primary">변화 탐지</h3>
              <p className="mb-16 text-body-sm-regular text-text-secondary">
                관심 구역을 지정하세요. 시계열 위성영상 기반 변화 탐지가
                시뮬레이션됩니다.
              </p>
              <div className="rounded-md bg-bg-secondary px-12 py-8 text-body-sm-regular text-text-secondary">
                왼쪽 상단 도구로 관심 구역을 그리세요
              </div>
            </div>
          )}

          {phase === 'analyzing' && (
            <div className="flex flex-col items-center gap-12 p-16 text-center md:p-20">
              <Spinner />
              <p className="text-body-sm-regular text-text-secondary">시계열 분석 중...</p>
            </div>
          )}

          {phase === 'result' && result && (
            <div>
              <div className="flex items-center justify-between py-8 pl-16 pr-8">
                <h3 className="text-heading-lg text-text-primary">변화 탐지 결과</h3>
                <Button variant="text" size="sm" onClick={handleReset}>
                  초기화
                </Button>
              </div>
              <Separator />

              <div className="relative h-100 overflow-hidden">
                <img
                  src="https://earthpaper.s3.ap-northeast-2.amazonaws.com/post/v2/editor/48/Thumbnail-satellite-imagery-changes-five-major-north-korean-shipyards-ports_.png"
                  alt="변화 탐지 위성영상"
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-bg-secondary to-transparent to-60%" />
              </div>

              <div className="p-16">
                {([
                  { label: '분석 면적', value: `${fmtNum(result.areaKm2, 1)} km²` },
                  { label: '분석 기간', value: result.assessmentPeriod },
                  { label: '관측 횟수', value: `${result.observationCount}회` },
                  { label: '변화 구역', value: `${result.changedZones}개`, tone: 'warning' },
                  { label: '신규 구조물', value: `${result.newStructures}개`, tone: result.newStructures > 0 ? 'danger' : undefined },
                  { label: '차량 활동', value: result.vehicleActivity, tone: result.vehicleActivity === '증가 추세' ? 'warning' : undefined },
                  { label: '열원 이상', value: `${result.thermalAnomalies}건`, tone: 'danger' },
                  { label: '신뢰도', value: CONFIDENCE_LABELS[result.confidenceLevel], tone: CONFIDENCE_TONE[result.confidenceLevel] },
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
                  onClick={() => { trackEvent('simulator_event', 'lead_form_opened', { vertical: 'northpaper' }); setShowLeadForm(true); }}
                >
                  인텔리전스 리포트 요청
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-12 text-body-xs-regular text-text-tertiary">
        시뮬레이션 데이터입니다. 실 서비스에서는 다중 위성 시계열 분석이 적용됩니다.
      </p>

      <LeadCaptureModal
        open={showLeadForm}
        onClose={() => setShowLeadForm(false)}
        vertical="northpaper"
        accentColor="#3D5A80"
      />
    </section>
  );
}
