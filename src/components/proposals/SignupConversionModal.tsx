'use client';

import { useState } from 'react';
import { MODAL_STEP } from '@/lib/agent-tutorial-steps';

interface SignupConversionModalProps {
  open: boolean;
  onReplay: () => void;
  onClose: () => void;
}

// 스텝 5 — 튜토리얼의 클라이맥스이자 전환 지점.
// CTA 는 데모에서는 비활성: 클릭하면 실서비스 연결 안내 툴팁만 띄운다
// (재시작 순환은 승인자를 혼란시킬 수 있어 배제 — 설계문서 구현 스펙).
export default function SignupConversionModal({
  open,
  onReplay,
  onClose,
}: SignupConversionModalProps) {
  const [ctaHint, setCtaHint] = useState(false);

  if (!open || !MODAL_STEP) return null;

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center p-6"
      style={{ background: 'rgba(14,14,16,0.75)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-modal-title"
    >
      <div
        className="relative w-full max-w-md p-8 text-center"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {/* 투어 팝오버의 X 와 동일한 룩 — 흰 글리프, 배경 없음, hover 시만 배경 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--surface-elevated)]"
          style={{ color: 'var(--text)', fontSize: 18 }}
          aria-label="닫기"
        >
          ✕
        </button>

        <p
          className="text-xs font-mono tracking-wider uppercase mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Step 5 / 5 — 가입 전환
        </p>

        <h3
          id="signup-modal-title"
          className="text-xl font-semibold mb-3"
          style={{ color: 'var(--text)' }}
        >
          {MODAL_STEP.title}
        </h3>

        <p className="text-[15px] leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
          {MODAL_STEP.body}
        </p>

        <div className="relative">
          <button
            onClick={() => setCtaHint(true)}
            className="w-full py-3 rounded-md text-sm font-semibold transition-opacity hover:opacity-85"
            style={{ background: 'var(--accent)', color: '#0E0E10' }}
          >
            회원가입하고 시작하기
          </button>
          {ctaHint && (
            <div
              className="absolute left-1/2 -translate-x-1/2 -top-11 px-3 py-2 rounded-md text-xs whitespace-nowrap"
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              role="status"
            >
              실서비스에서는 여기서 가입 플로우로 연결됩니다
            </div>
          )}
        </div>

        <button
          onClick={onReplay}
          className="mt-4 text-xs underline underline-offset-2 transition-colors hover:text-[var(--text)]"
          style={{ color: 'var(--text-muted)' }}
        >
          데모 다시 보기
        </button>
      </div>
    </div>
  );
}
