'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type mapboxgl from 'mapbox-gl';
import { addWardenOverlay, removeSimulatorOverlay } from '@/lib/simulator-overlays';
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

interface ScreeningResult {
  areaKm2: number;
  baselineForestKm2: number;
  currentForestKm2: number;
  deforestationKm2: number;
  deforestationPct: number;
  plotsAnalyzed: number;
  riskPlots: number;
  lastObservation: string;
}

function generateScreening(areaKm2: number): ScreeningResult {
  const seed = Math.round(areaKm2 * 100) % 100;
  const forestRatio = 0.68 + (seed % 20) * 0.01;
  const baselineForest = areaKm2 * forestRatio;
  const deforestationRate = 0.03 + (seed % 5) * 0.01;
  const deforestation = baselineForest * deforestationRate;

  return {
    areaKm2,
    baselineForestKm2: baselineForest,
    currentForestKm2: baselineForest - deforestation,
    deforestationKm2: deforestation,
    deforestationPct: deforestationRate * 100,
    plotsAnalyzed: Math.max(1, Math.floor(areaKm2 / 5)),
    riskPlots: Math.max(1, Math.floor(areaKm2 / 20)),
    lastObservation: '2026. 07. 10.',
  };
}

type Phase = 'draw' | 'analyzing' | 'result';

const RESULT_ROWS = [
  { key: 'area', label: '스크리닝 면적', fmt: (r: ScreeningResult) => `${fmtNum(r.areaKm2, 1)} km²` },
  { key: 'baseline', label: '기준선 산림 (2020)', fmt: (r: ScreeningResult) => `${fmtNum(r.baselineForestKm2, 1)} km²` },
  { key: 'current', label: '현재 산림면적', fmt: (r: ScreeningResult) => `${fmtNum(r.currentForestKm2, 1)} km²` },
  { key: 'deforestation', label: '산림전용 탐지', fmt: (r: ScreeningResult) => `${fmtNum(r.deforestationKm2, 2)} km² (${fmtNum(r.deforestationPct, 1)}%)`, color: '#C45C4A' },
  { key: 'plots', label: '분석 플롯', fmt: (r: ScreeningResult) => `${fmtNum(r.plotsAnalyzed)}개` },
  { key: 'risk', label: '위험 플롯', fmt: (r: ScreeningResult) => `${fmtNum(r.riskPlots)}개`, color: '#C8923A' },
  { key: 'obs', label: '마지막 관측', fmt: (r: ScreeningResult) => r.lastObservation },
] as const;

export default function WardenSimulator() {
  const [phase, setPhase] = useState<Phase>('draw');
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const polyRef = useRef<GeoJSON.Polygon | null>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current) {
      trackEvent('simulator_event', 'simulator_viewed', { vertical: 'warden' });
      trackedRef.current = true;
    }
  }, []);

  const handleMapReady = useCallback((m: mapboxgl.Map) => {
    mapRef.current = m;
  }, []);

  const clearOverlay = useCallback(() => {
    if (mapRef.current) removeSimulatorOverlay(mapRef.current, 'warden');
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
      trackEvent('simulator_event', 'aoi_drawn', { vertical: 'warden', areaKm2: aoi.areaKm2 });
      setTimeout(() => {
        const r = generateScreening(aoi.areaKm2);
        setResult(r);
        setPhase('result');
        trackEvent('simulator_event', 'result_viewed', { vertical: 'warden' });
        if (mapRef.current && polyRef.current) {
          addWardenOverlay(mapRef.current, polyRef.current, r);
        }
      }, 2000);
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
          EUDR 스크리닝 체험
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
          center={[116.0, -1.0]}
          zoom={8}
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
                EUDR 스크리닝
              </h3>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  marginBottom: 16,
                }}
              >
                지도에서 공급 플롯 영역을 그려보세요. Sentinel-2 기반 산림전용 자동
                판정이 시뮬레이션됩니다.
              </p>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'rgba(107, 138, 94, 0.12)',
                  fontSize: 12,
                  color: '#6B8A5E',
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                왼쪽 상단 도구로 영역을 그리세요
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
                  borderTopColor: '#6B8A5E',
                  borderRadius: '50%',
                  animation: 'warden-spin 1s linear infinite',
                }}
              />
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                Sentinel-2 분석 중...
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
                    color: '#6B8A5E',
                    fontWeight: 600,
                  }}
                >
                  스크리닝 결과
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
                  src="https://earthpaper.s3.ap-northeast-2.amazonaws.com/post/v2/editor/51/Thumbnail-indonesia-raja-ampat-nickel-mining-permits-forest-loss.png"
                  alt="산림전용 분석 위성영상"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--surface) 0%, transparent 60%)' }} />
              </div>

              <div style={{ padding: 16 }}>
                {RESULT_ROWS.map((row) => (
                  <div
                    key={row.key}
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
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: ('color' in row && row.color) || 'var(--text)',
                      }}
                    >
                      {row.fmt(result)}
                    </span>
                  </div>
                ))}

                <button
                  onClick={() => { trackEvent('simulator_event', 'lead_form_opened', { vertical: 'warden' }); setShowLeadForm(true); }}
                  style={{
                    width: '100%',
                    marginTop: 16,
                    padding: '10px',
                    minHeight: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    background: '#6B8A5E',
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
                  DDS 보고서 요청
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
        시뮬레이션 데이터입니다. 실 서비스에서는 Sentinel-2 위성영상 기반으로
        분석됩니다.
      </p>

      <style>{`
        @keyframes warden-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <LeadCaptureModal
        open={showLeadForm}
        onClose={() => setShowLeadForm(false)}
        vertical="warden"
        accentColor="#6B8A5E"
      />
    </section>
  );
}
