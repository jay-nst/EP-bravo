'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

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

const SEVERITY_COLORS = {
  low: '#4A9E6B',
  moderate: '#C8923A',
  high: '#C45C4A',
};

const SEVERITY_LABELS = {
  low: '경미',
  moderate: '보통',
  high: '심각',
};

export default function CitadelSimulator() {
  const [phase, setPhase] = useState<Phase>('draw');
  const [result, setResult] = useState<DisasterResult | null>(null);

  const handleAoiChange = useCallback(
    (aoi: { areaKm2: number } | null) => {
      if (!aoi) {
        setPhase('draw');
        setResult(null);
        return;
      }

      setPhase('analyzing');
      setTimeout(() => {
        setResult(generateDisaster(aoi.areaKm2));
        setPhase('result');
      }, 1800);
    },
    [],
  );

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
          재난 피해 분석 체험
        </span>
      </div>

      <div
        style={{
          position: 'relative',
          height: 480,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        <EarthMap
          onAoiChange={handleAoiChange}
          initialStyle="satellite"
          center={[127.7, 34.95]}
          zoom={11}
        />

        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 280,
            borderRadius: 8,
            background: 'var(--panel-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
        >
          {phase === 'draw' && (
            <div style={{ padding: 20 }}>
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: 8,
                }}
              >
                재난 피해 분석
              </h3>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  marginBottom: 16,
                }}
              >
                피해 지역을 그려보세요. NDVI/dNBR 기반 피해 범위와 심각도가
                시뮬레이션됩니다.
              </p>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'rgba(196, 92, 74, 0.12)',
                  fontSize: 12,
                  color: '#C45C4A',
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                왼쪽 상단 도구로 피해 지역을 그리세요
              </div>
            </div>
          )}

          {phase === 'analyzing' && (
            <div style={{ padding: 20, textAlign: 'center' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  margin: '0 auto 12px',
                  border: '2px solid var(--border)',
                  borderTopColor: '#C45C4A',
                  borderRadius: '50%',
                  animation: 'citadel-spin 1s linear infinite',
                }}
              />
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                NDVI / dNBR 분석 중...
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
                    color: '#C45C4A',
                    fontWeight: 600,
                  }}
                >
                  피해 분석 결과
                </span>
                <button
                  onClick={() => {
                    setPhase('draw');
                    setResult(null);
                  }}
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

              <div style={{ padding: 16 }}>
                {[
                  { label: '분석 면적', value: `${result.areaKm2.toFixed(1)} km²` },
                  { label: '피해 면적', value: `${result.affectedAreaKm2.toFixed(1)} km² (${result.affectedPct.toFixed(0)}%)`, color: '#C8923A' },
                  { label: '소실 면적', value: `${result.burnedAreaKm2.toFixed(2)} km²`, color: '#C45C4A' },
                  { label: '피해 건물', value: `${result.damagedBuildings}동`, color: '#C45C4A' },
                  { label: 'NDVI 감소', value: `${result.ndviDrop}%` },
                  { label: '심각도', value: SEVERITY_LABELS[result.severityLevel], color: SEVERITY_COLORS[result.severityLevel] },
                  { label: '회복 예상', value: `${result.estimatedRecoveryMonths}개월` },
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
                  style={{
                    width: '100%',
                    marginTop: 16,
                    padding: '10px',
                    borderRadius: 6,
                    background: '#C45C4A',
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
                  SLA 리포트 생성
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
        시뮬레이션 데이터입니다. 실 서비스에서는 다중 위성영상 기반으로 분석됩니다.
      </p>

      <style>{`
        @keyframes citadel-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
