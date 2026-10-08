'use client';

import { useState } from 'react';
import { Button, Dialog } from '@naraspace-technology/nds/components';
import { IconX } from '@naraspace-technology/nds/icons';
import { MODAL_STEP, type OrderTrack } from '@/lib/order-tutorial-steps';

interface OrderSignupModalProps {
  open: boolean;
  track: OrderTrack;
  /** 끝까지 따라왔을 때만 주문 요약을 보여 준다 (건너뛰면 고른 게 없다) */
  completed: boolean;
  onReplay: () => void;
  onClose: () => void;
}

// 방금 따라 한 주문 내용 — 캡쳐 시나리오 값 그대로 (order-tutorial-steps.ts 상단 주석)
const SUMMARY: Record<OrderTrack, { label: string; value: string }[]> = {
  archive: [
    { label: '영상', value: 'SpaceEye-T · 2026.05.31' },
    { label: '영역', value: '후쿠오카 도심 27.82 km²' },
    { label: '결제 금액', value: '$278.20' },
  ],
  tasking: [
    { label: '촬영', value: 'SpaceEye-T (Assured) · 예시 일정' },
    { label: '지점', value: '후쿠오카 하카타항' },
    { label: '결제 금액', value: '$1,800.00' },
  ],
};

// 튜토리얼의 마지막 — 가입 전환 지점. NDS 참조 패턴(LeadCaptureModal)과 같은 구성:
// Dialog.Root open + onOpenChange(false → onClose), 닫기는 Dialog.Close + text iconOnly 버튼.
// 데모라 가입 CTA 는 실제로 이동하지 않고 안내 문구만 보여 준다.
export default function OrderSignupModal({ open, track, completed, onReplay, onClose }: OrderSignupModalProps) {
  const [ctaHint, setCtaHint] = useState(false);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setCtaHint(false);
          onClose();
        }
      }}
    >
      <Dialog.Popup>
        <div className="flex items-start justify-between gap-12">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-body-xs-regular uppercase tracking-[0.08em] text-text-interactive-selected">
              {track === 'archive' ? 'Archive 주문' : 'Tasking 주문'}
            </p>
            <Dialog.Title>{MODAL_STEP.title}</Dialog.Title>
          </div>
          <Dialog.Close render={<Button variant="text" size="sm" iconOnly aria-label="닫기" />}>
            <IconX />
          </Dialog.Close>
        </div>

        <Dialog.Description className="text-text-secondary">{MODAL_STEP.body}</Dialog.Description>

        {completed && (
          <dl className="flex flex-col gap-8 rounded-sm border border-border-tertiary p-16">
            {SUMMARY[track].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-12">
                <dt className="text-body-sm-regular text-text-tertiary">{row.label}</dt>
                <dd className="text-body-sm-medium text-text-primary">{row.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <Dialog.Footer className="flex-col gap-8">
          <Button variant="solid" size="lg" display="block" onClick={() => setCtaHint(true)}>
            회원가입하고 주문하기
          </Button>
          {ctaHint && (
            <p role="status" className="text-center text-body-xs-regular text-text-tertiary">
              실서비스에서는 여기서 가입 화면으로 넘어갑니다
            </p>
          )}
          <Button variant="text" size="sm" display="block" onClick={onReplay}>
            데모 다시 보기
          </Button>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
