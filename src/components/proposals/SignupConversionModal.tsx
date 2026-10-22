'use client';

import { useState } from 'react';
import { Dialog } from '@naraspace-technology/nds/components';
import {
  MODAL_STEP_BY_LOCALE,
  TUTORIAL_UI_COPY,
  type TutorialLocale,
} from '@/lib/agent-tutorial-i18n';

interface SignupConversionModalProps {
  open: boolean;
  onReplay: () => void;
  onClose: () => void;
  /** 카피 언어 (2026-10-22 한/영 토글) */
  locale?: TutorialLocale;
}

// 스텝 5 — 튜토리얼의 클라이맥스이자 전환 지점.
// CTA 는 데모에서는 비활성: 클릭하면 실서비스 연결 안내만 띄운다
// (재시작 순환은 승인자를 혼란시킬 수 있어 배제 — 설계문서 구현 스펙).
//
// NDS Dialog anatomy (참조: src/components/shared/LeadCaptureModal.tsx):
// Title → Description → 본문(CTA 안내) → Footer(Cancel + Action), × 없음.
// (SubDescription 의 스텝 라벨은 2026-10-19 피그마 리뷰로 삭제)
//  - 닫기 = Esc · 바깥 클릭 → onClose (기존 × 와 같은 경로)
//  - Cancel 자리 = '데모 다시 보기' → onReplay. Cancel 은 Dialog.Close 라 그대로 두면
//    onReplay 직후 onOpenChange(false) → onClose 가 이어져 재시작이 'done' 으로 덮인다.
//    그래서 Base UI 의 닫기 핸들러를 막고(preventBaseUIHandler) onReplay 만 부른다 —
//    부모가 phase 를 바꾸면 open=false 로 닫힌다
//  - Action = SIGNUP_CTA_LABEL('가입하고 분석 시작하기') → 닫지 않고 안내 문구만 표시
// 색은 NDS 기본이 아니라 원본(597a0fd) 값 그대로 (NDS_FULL_ADOPTION_RULES §8): 스크림 rgba(14,14,16,0.75)+blur,
// surface 팝업, muted 설명·스텝 라벨, 민트 CTA + 어두운 글자, 다시 보기 = muted 글자 → hover 시 text.
export default function SignupConversionModal({
  open,
  onReplay,
  onClose,
  locale = 'ko',
}: SignupConversionModalProps) {
  const [ctaHint, setCtaHint] = useState(false);
  const modalStep = MODAL_STEP_BY_LOCALE[locale];
  const t = TUTORIAL_UI_COPY[locale];

  if (!modalStep) return null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <Dialog.Popup
        className="bg-bg-secondary"
        slotProps={{ backdrop: { className: 'bg-[rgba(14,14,16,0.75)] backdrop-blur-[4px]' } }}
      >
        <Dialog.Title>{modalStep.title}</Dialog.Title>
        <Dialog.Description className="text-text-tertiary">{modalStep.body}</Dialog.Description>

        {ctaHint && (
          <p role="status" className="text-body-sm-regular text-text-primary">
            {t.signupCtaHint}
          </p>
        )}

        {/* 2026-10-19 피그마 리뷰: 'Step 5 / 5 — 가입 전환' 라벨 삭제 */}
        <Dialog.Footer>
          <Dialog.Cancel
            className="text-text-tertiary inset-ring-transparent not-data-disabled:not-aria-invalid:hover:bg-transparent not-data-disabled:not-aria-invalid:hover:inset-ring-transparent not-data-disabled:not-aria-invalid:hover:text-text-primary not-data-disabled:data-active:not-hover:bg-transparent not-data-disabled:data-active:not-hover:text-text-tertiary"
            onClick={(event) => {
              event.preventBaseUIHandler();
              onReplay();
            }}
          >
            {t.replay}
          </Dialog.Cancel>
          <Dialog.Action
            className="bg-bg-interactive-primary text-text-inverse transition-opacity hover:opacity-85 not-data-disabled:not-aria-invalid:hover:bg-bg-interactive-primary not-data-disabled:data-active:not-hover:text-text-inverse"
            onClick={() => setCtaHint(true)}
          >
            {t.signupCta}
          </Dialog.Action>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
