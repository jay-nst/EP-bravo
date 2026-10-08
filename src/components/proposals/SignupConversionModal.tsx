'use client';

import { useState } from 'react';
import { Dialog } from '@naraspace-technology/nds/components';
import { MODAL_STEP } from '@/lib/agent-tutorial-steps';

interface SignupConversionModalProps {
  open: boolean;
  onReplay: () => void;
  onClose: () => void;
}

// 스텝 5 — 튜토리얼의 클라이맥스이자 전환 지점.
// CTA 는 데모에서는 비활성: 클릭하면 실서비스 연결 안내만 띄운다
// (재시작 순환은 승인자를 혼란시킬 수 있어 배제 — 설계문서 구현 스펙).
//
// NDS Dialog anatomy (참조: src/components/shared/LeadCaptureModal.tsx):
// Title → Description → 본문(CTA 안내) → SubDescription → Footer(Cancel + Action), × 없음.
//  - 닫기 = Esc · 바깥 클릭 → onClose (기존 × 와 같은 경로)
//  - Cancel 자리 = '데모 다시 보기' → onReplay. Cancel 은 Dialog.Close 라 그대로 두면
//    onReplay 직후 onOpenChange(false) → onClose 가 이어져 재시작이 'done' 으로 덮인다.
//    그래서 Base UI 의 닫기 핸들러를 막고(preventBaseUIHandler) onReplay 만 부른다 —
//    부모가 phase 를 바꾸면 open=false 로 닫힌다
//  - Action = '회원가입하고 시작하기' → 닫지 않고 안내 문구만 표시
// 색은 NDS 기본이 아니라 원본(597a0fd) 값 그대로 (NDS_FULL_ADOPTION_RULES §8): 스크림 rgba(14,14,16,0.75)+blur,
// surface 팝업, muted 설명·스텝 라벨, 민트 CTA + 어두운 글자, 다시 보기 = muted 글자 → hover 시 text.
export default function SignupConversionModal({
  open,
  onReplay,
  onClose,
}: SignupConversionModalProps) {
  const [ctaHint, setCtaHint] = useState(false);

  if (!MODAL_STEP) return null;

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
        <Dialog.Title>{MODAL_STEP.title}</Dialog.Title>
        <Dialog.Description className="text-text-tertiary">{MODAL_STEP.body}</Dialog.Description>

        {ctaHint && (
          <p role="status" className="text-body-sm-regular text-text-primary">
            실서비스에서는 여기서 가입 플로우로 연결됩니다
          </p>
        )}

        <Dialog.SubDescription className="text-text-tertiary">Step 5 / 5 — 가입 전환</Dialog.SubDescription>
        <Dialog.Footer>
          <Dialog.Cancel
            className="text-text-tertiary inset-ring-transparent not-data-disabled:not-aria-invalid:hover:bg-transparent not-data-disabled:not-aria-invalid:hover:inset-ring-transparent not-data-disabled:not-aria-invalid:hover:text-text-primary not-data-disabled:data-active:not-hover:bg-transparent not-data-disabled:data-active:not-hover:text-text-tertiary"
            onClick={(event) => {
              event.preventBaseUIHandler();
              onReplay();
            }}
          >
            데모 다시 보기
          </Dialog.Cancel>
          <Dialog.Action
            className="bg-bg-interactive-primary text-[#0E0E10] transition-opacity hover:opacity-85 not-data-disabled:not-aria-invalid:hover:bg-bg-interactive-primary not-data-disabled:data-active:not-hover:text-[#0E0E10]"
            onClick={() => setCtaHint(true)}
          >
            회원가입하고 시작하기
          </Dialog.Action>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
