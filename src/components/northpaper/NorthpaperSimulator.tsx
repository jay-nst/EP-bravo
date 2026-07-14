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

const CONFIDENCE_COLORS = {
  high: '#C45C4A',
  medium: '#C8923A',
  low: '#4A9E6B',
};

const CONFIDENCE_LABELS = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

export default function NorthpaperSimulator() {
  const [phase, setPhase] = useState<Phase>('draw');
  const [result, setResult] = useState<ChangeDetectionResult | null>(null);

  const handleAoiChange = useCallback(
    (aoi: { areaKm2: number } | null) => {
      if (!aoi) {
        setPhase('draw');
        setResult(null);
        return;
      }

      setPhase('analyzing');
      setTimeout(() => {
        setResult(generateChangeDetection(aoi.areaKm2));
        setPhase('result');
      }, 2500);
    },
    [],
  );

  return (
    <div>
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
          변화 탐지 체험
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
          center={[126.5, 37.95]}
          zoom={12}
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
                변화 탐지
              </h3>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  marginBottom: 16,
                }}
              >
                관심 구역을 지정하세요. 시계열 위성영상 기반 변화 탐지가
                시뮬레이션됩니다.
              </p>
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'rgba(61, 90, 128, 0.12)',
                  fontSize: 12,
                  color: '#3D5A80',
                  fontFamily: "'IBM Plex Mono', monospace",
                }}
              >
                왼쪽 상단 도구로 관심 구역을 그리세요
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
                  borderTopColor: '#3D5A80',
                  borderRadius: '50%',
                  animation: 'northpaper-spin 1s linear infinite',
                }}
              />
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                시계열 분석 중...
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
                    color: '#3D5A80',
                    fontWeight: 600,
                  }}
                >
                  변화 탐지 결과
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
                  { label: '분석 기간', value: result.assessmentPeriod },
                  { label: '관측 횟수', value: `${result.observationCount}회` },
                  { label: '변화 구역', value: `${result.changedZones}개`, color: '#C8923A' },
                  { label: '신규 구조물', value: `${result.newStructures}개`, color: result.newStructures > 0 ? '#C45C4A' : undefined },
                  { label: '차량 활동', value: result.vehicleActivity, color: result.vehicleActivity === '증가 추세' ? '#C8923A' : undefined },
                  { label: '열원 이상', value: `${result.thermalAnomalies}건`, color: '#C45C4A' },
                  { label: '신뢰도', value: CONFIDENCE_LABELS[result.confidenceLevel], color: CONFIDENCE_COLORS[result.confidenceLevel] },
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
                    background: '#3D5A80',
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
                  인텔리전스 리포트 생성
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
        시뮬레이션 데이터입니다. 실 서비스에서는 다중 위성 시계열 분석이 적용됩니다.
      </p>

      <style>{`
        @keyframes northpaper-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
