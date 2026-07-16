'use client';

import { useState, useRef, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  vertical: 'citadel' | 'predict' | 'warden' | 'northpaper';
  accentColor: string;
}

const ROLE_OPTIONS = [
  { value: '', label: '선택해주세요' },
  { value: 'compliance', label: '컴플라이언스 / 규제' },
  { value: 'finance', label: '금융 / 투자' },
  { value: 'government', label: '공공 / 정부기관' },
  { value: 'research', label: '연구 / 학술' },
  { value: 'other', label: '기타' },
];

const BUDGET_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: 'under_10k', label: '1,000만원 미만' },
  { value: '10k_50k', label: '1,000만원 ~ 5,000만원' },
  { value: '50k_100k', label: '5,000만원 ~ 1억원' },
  { value: 'over_100k', label: '1억원 이상' },
];

const VERTICAL_LABELS: Record<string, string> = {
  citadel: 'Citadel — 재난 모니터링',
  predict: 'Predict — 자산 검증',
  warden: 'Warden — 산림 컴플라이언스',
  northpaper: 'Northpaper — 변화 탐지',
};

export default function LeadCaptureModal({ open, onClose, vertical, accentColor }: LeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [useCase, setUseCase] = useState('');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !company.trim() || !role) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          role,
          use_case: useCase.trim(),
          budget,
          vertical,
        }),
      });

      if (!res.ok) {
        setError('제출에 실패했습니다. 다시 시도해주세요.');
        setSubmitting(false);
        return;
      }

      trackEvent('form_submit', 'lead_capture', { vertical, role, budget });
      setSubmitted(true);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    fontFamily: 'var(--font-pretendard), sans-serif',
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    outline: 'none',
    transition: 'border-color 0.15s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-muted)',
    marginBottom: 6,
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          width: '100%', maxWidth: 440,
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          animation: 'lead-modal-in 0.2s ease-out',
        }}
      >
        {submitted ? (
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: accentColor, margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>
              &#10003;
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              등록 완료
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              관심을 가져주셔서 감사합니다.<br />
              담당자가 빠르게 연락드리겠습니다.
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: 24, padding: '10px 24px',
                background: 'var(--surface)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: 8,
                fontSize: 14, cursor: 'pointer',
              }}
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <div style={{
              padding: '20px 24px 16px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: accentColor, marginBottom: 4,
                }}>
                  {VERTICAL_LABELS[vertical]}
                </p>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>
                  상세 리포트 요청
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="닫기"
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>이름 *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>이메일 *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hong@company.com"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>소속 *</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="회사 또는 기관명"
                    style={inputStyle}
                    onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>담당 분야 *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>활용 목적</label>
                  <textarea
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    placeholder="어떤 업무에 위성 데이터를 활용하고 싶으신가요?"
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>예상 연간 예산 (선택)</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = accentColor; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    {BUDGET_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <p style={{ fontSize: 13, color: 'var(--error)', marginTop: 12 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%', marginTop: 20, padding: '12px',
                  minHeight: 48, borderRadius: 8,
                  background: accentColor, color: '#fff',
                  fontSize: 15, fontWeight: 600,
                  border: 'none', cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  transition: 'opacity 0.15s ease',
                }}
                onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = submitting ? '0.7' : '1'; }}
              >
                {submitting ? '제출 중...' : '리포트 요청하기'}
              </button>

              <p style={{
                fontSize: 12, color: 'var(--text-muted)', textAlign: 'center',
                marginTop: 12, lineHeight: 1.5,
              }}>
                입력하신 정보는 서비스 안내 목적으로만 사용됩니다.
              </p>
            </form>
          </>
        )}

        <style>{`
          @keyframes lead-modal-in {
            from { opacity: 0; transform: translateY(12px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
