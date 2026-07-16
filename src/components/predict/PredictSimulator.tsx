'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type mapboxgl from 'mapbox-gl';
import { addPredictOverlay, removeSimulatorOverlay } from '@/lib/simulator-overlays';
import { trackEvent } from '@/lib/analytics';
import { fmtNum } from '@/lib/format';
import LeadCaptureModal from '@/components/shared/LeadCaptureModal';

const EarthMap = dynamic(() => import('@/components/map/EarthMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}
    >
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>지도 로딩 중...</p>
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
    <section style={{ padding: '0 24px 64px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          자산 검증 체험
        </span>
      </div>

      <div
        className="h-[320px] md:h-[480px]"
        style={{
          position: 'relative',
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        <EarthMap
          onAoiChange={handleAoiChange}
          onMapReady={handleMapReady}
          initialStyle="satellite"
          center={[72.0, 27.0]}
          zoom={9}
        />

        <div
          className="absolute bottom-0 left-0 right-0 max-h-[75%] overflow-y-auto rounded-t-lg md:bottom-auto md:left-auto md:right-3 md:top-3 md:w-[280px] md:max-h-[calc(100%-24px)] md:overflow-y-auto md:rounded-lg"
          style={{
            background: 'var(--panel-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            pointerEvents: 'auto',
          }}
        >
          {phase === 'draw' && (
            <div className="p-4 md:p-5">
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: 8,
                }}
              >
                자산 검증
              </h3>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  marginBottom: 16,
                }}
              >
                태양광 발전소 경계를 그려보세요. 위성영상 기반 자산 존재·상태
                검증이 시뮬레이션됩니다.
              </p>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'rgba(74, 158, 196, 0.12)',
                  fontSize: 12,
                  color: '#4A9EC4',
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                왼쪽 상단 도구로 발전소 경계를 그리세요
              </div>
            </div>
          )}

          {phase === 'analyzing' && (
            <div className="p-4 md:p-5" style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  margin: '0 auto 12px',
                  border: '2px solid var(--border)',
                  borderTopColor: '#4A9EC4',
                  borderRadius: '50%',
                  animation: 'predict-spin 1s linear infinite',
                }}
              />
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                위성영상 분석 중...
              </p>
            </div>
          )}

          {phase === 'result' && result && (
            <div>
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#4A9EC4',
                    fontWeight: 600,
                  }}
                >
                  검증 결과
                </span>
                <button
                  onClick={handleReset}
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                  }}
                >
                  초기화
                </button>
              </div>

              <div style={{ position: 'relative', height: 100, overflow: 'hidden' }}>
                <img
                  src="https://earthpaper.s3.ap-northeast-2.amazonaws.com/post/v2/editor/28/Thumbnail-corn-belt-yield-model-97pct-accuracy-satellite-forecast.png"
                  alt="자산 검증 위성영상"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface) 0%, transparent 60%)' }} />
              </div>

              <div style={{ padding: 16 }}>
                {[
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
                    color: result.intrusionZones > 0 ? '#C8923A' : '#4A9E6B',
                  },
                  {
                    label: '검증 상태',
                    value: result.status === 'verified' ? '가동 확인' : '주의 필요',
                    color: result.status === 'verified' ? '#4A9E6B' : '#C8923A',
                  },
                  { label: '마지막 관측', value: result.lastObservation },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: item.color || 'var(--text)',
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}

                <button
                  onClick={() => { trackEvent('simulator_event', 'lead_form_opened', { vertical: 'predict' }); setShowLeadForm(true); }}
                  style={{
                    width: '100%',
                    marginTop: 16,
                    padding: '10px',
                    minHeight: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    background: '#4A9EC4',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity var(--duration-short) var(--ease-enter)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  검증 리포트 요청
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: 'var(--text-muted)',
          marginTop: 12,
          letterSpacing: '0.04em',
        }}
      >
        시뮬레이션 데이터입니다. 실 서비스에서는 고해상도 위성영상 기반으로
        검증됩니다.
      </p>

      <style>{`
        @keyframes predict-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <LeadCaptureModal
        open={showLeadForm}
        onClose={() => setShowLeadForm(false)}
        vertical="predict"
        accentColor="#4A9EC4"
      />
    </section>
  );
}
