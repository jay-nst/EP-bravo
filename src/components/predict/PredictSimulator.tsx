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

  const handleAoiChange = useCallback(
    (aoi: { areaKm2: number } | null) => {
      if (!aoi) {
        setPhase('draw');
        setResult(null);
        return;
      }

      setPhase('analyzing');
      setTimeout(() => {
        setResult(generateVerification(aoi.areaKm2));
        setPhase('result');
      }, 2200);
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
          자산 검증 체험
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
          center={[72.0, 27.0]}
          zoom={9}
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
            <div style={{ padding: 20, textAlign: 'center' }}>
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
                  { label: '검증 면적', value: `${result.areaKm2.toFixed(1)} km²` },
                  { label: '자산 유형', value: result.assetType },
                  { label: '추정 용량', value: `${result.estimatedCapacityMW} MW` },
                  { label: '패널 커버리지', value: `${result.panelCoverage.toFixed(0)}%` },
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
                  style={{
                    width: '100%',
                    marginTop: 16,
                    padding: '10px',
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
                  검증 리포트 생성
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
    </section>
  );
}
