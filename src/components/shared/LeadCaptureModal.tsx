'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Form } from '@base-ui/react/form';
import { Dialog, Field, Input, Select, Textarea } from '@naraspace-technology/nds/components';
import { IconCheck } from '@naraspace-technology/nds/icons';
import { trackEvent } from '@/lib/analytics';

interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  vertical: 'citadel' | 'predict' | 'warden' | 'northpaper';
  /**
   * 플랫폼 색 (운영 색 복원, NDS_FULL_ADOPTION_RULES §8). 설명(eyebrow) 글자색, 제출 버튼 채움,
   * 입력 포커스 테두리, 완료 체크 원에 쓴다. `--lead-accent` CSS 변수로 Popup 하위에 전달
   */
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

// ── NDS 참조 구현 (2단계 #1) ─────────────────────────────────────────────
// NDS 문서(Dialog/Field *.docs.mdx, *.examples.tsx)의 anatomy 를 그대로 따른다.
//  - Dialog: Title → Description → (본문) → SubDescription → Footer(Cancel + Action).
//    × 버튼 없음 — 닫기는 Cancel·Esc·바깥 클릭. 스크롤 잠금·포커스 가두기는 Base UI
//  - 폼: Base UI Form + 필드별 validate + Field.Error. 제출 시 검증, 이후 입력하면 재검증.
//    Footer 의 Action 은 form 밖에 있으므로 form 속성으로 연결
//  - 표기: 필수가 대부분이라 선택 항목에만 Field.Optional ("한 폼 안에서 하나로 통일")
//  - Select: '' (미선택) ↔ null. "선택 안 함" 같은 해제 항목은 value null 인 item
//  - 색: 운영 버전(597a0fd) 색으로 덮는다 (§8) — 크기·모서리·패딩·타이포는 NDS 그대로
const FORM_ID = 'lead-capture-form';
const ROLE_ITEMS = ROLE_OPTIONS.filter((o) => o.value);
const BUDGET_ITEMS = BUDGET_OPTIONS.map((o) => ({ value: o.value || null, label: o.label }));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 운영 색 복원 — accentColor 는 Popup 의 `--lead-accent` 로 받는다
// 입력: surface 배경, border 테두리, 포커스 시 accentColor 테두리 (hover 색 변화 없음)
const INPUT_COLOR_CLASS = [
  'bg-bg-secondary',
  'has-not-aria-invalid:not-data-disabled:hover:inset-ring-border-tertiary',
  'has-not-aria-invalid:not-data-disabled:data-active:inset-ring-(color:--lead-accent)',
  'has-not-aria-invalid:focus-within:inset-ring-(color:--lead-accent)!',
].join(' ');
const SELECT_TRIGGER_COLOR_CLASS = [
  'bg-bg-secondary',
  'not-data-invalid:not-data-disabled:hover:inset-ring-border-tertiary',
  'not-data-invalid:data-popup-open:inset-ring-(color:--lead-accent)!',
  'not-data-invalid:focus-visible:inset-ring-(color:--lead-accent)!',
].join(' ');
// 제출: accentColor 채움 + 흰 글자, hover 는 opacity
const ACTION_COLOR_CLASS =
  'bg-(color:--lead-accent) text-white [&_svg]:text-white not-data-disabled:not-aria-invalid:hover:bg-(color:--lead-accent) hover:opacity-85';
// 취소(원래 × 닫기): surface 배경 + border + muted 글자 / 닫기(완료): surface 배경 + border + 본문 글자
const CANCEL_COLOR_CLASS =
  'bg-bg-secondary text-text-tertiary inset-ring-border-tertiary not-data-disabled:not-aria-invalid:hover:bg-bg-secondary not-data-disabled:not-aria-invalid:hover:inset-ring-border-tertiary hover:opacity-85';
const CLOSE_COLOR_CLASS =
  'bg-bg-secondary text-text-primary inset-ring-border-tertiary not-data-disabled:not-aria-invalid:hover:bg-bg-secondary not-data-disabled:not-aria-invalid:hover:inset-ring-border-tertiary hover:opacity-85';

const required = (message: string) => (value: unknown) => (String(value ?? '').trim() ? null : message);
const validateEmail = (value: unknown) => {
  const v = String(value ?? '').trim();
  if (!v) return '이메일을 입력해주세요.';
  return EMAIL_RE.test(v) ? null : '이메일 형식을 확인해주세요.';
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

  // Form 이 모든 필드 validate 를 통과시켰을 때만 호출된다
  const handleSubmit = async () => {
    setError('');
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

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <Dialog.Popup
        className="max-h-[calc(100vh-32px)] overflow-y-auto"
        style={{ '--lead-accent': accentColor } as CSSProperties}
      >
        {submitted ? (
          <>
            <span
              aria-hidden
              className="flex size-48 items-center justify-center rounded-full bg-(color:--lead-accent) text-text-primary"
            >
              <IconCheck className="size-24" />
            </span>
            <Dialog.Title>등록 완료</Dialog.Title>
            <Dialog.Description className="text-text-tertiary">
              관심을 가져주셔서 감사합니다. 담당자가 빠르게 연락드리겠습니다.
            </Dialog.Description>
            <Dialog.Footer>
              <Dialog.Cancel className={CLOSE_COLOR_CLASS}>닫기</Dialog.Cancel>
            </Dialog.Footer>
          </>
        ) : (
          <>
            <Dialog.Title>상세 리포트 요청</Dialog.Title>
            <Dialog.Description className="text-(color:--lead-accent)">{VERTICAL_LABELS[vertical]}</Dialog.Description>

            <Form id={FORM_ID} onFormSubmit={handleSubmit} className="flex flex-col gap-16">
              <Field.Root name="name" validate={required('이름을 입력해주세요.')}>
                <Field.Label className="text-text-tertiary">이름</Field.Label>
                <Input className={INPUT_COLOR_CLASS} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
                <Field.Error />
              </Field.Root>

              <Field.Root name="email" validate={validateEmail}>
                <Field.Label className="text-text-tertiary">이메일</Field.Label>
                <Input className={INPUT_COLOR_CLASS} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hong@company.com" />
                <Field.Error />
              </Field.Root>

              <Field.Root name="company" validate={required('소속을 입력해주세요.')}>
                <Field.Label className="text-text-tertiary">소속</Field.Label>
                <Input className={INPUT_COLOR_CLASS} type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="회사 또는 기관명" />
                <Field.Error />
              </Field.Root>

              <Field.Root name="role" validate={required('담당 분야를 선택해주세요.')}>
                <Field.Label className="text-text-tertiary">담당 분야</Field.Label>
                <Select.Root<string | null>
                  items={ROLE_ITEMS}
                  value={role || null}
                  onValueChange={(v) => setRole(v ?? '')}
                >
                  <Select.Trigger className={SELECT_TRIGGER_COLOR_CLASS}>
                    <Select.Value placeholder={ROLE_OPTIONS[0].label} />
                  </Select.Trigger>
                  <Select.Popup>
                    {ROLE_ITEMS.map((opt) => (
                      <Select.Item key={opt.value} value={opt.value}>{opt.label}</Select.Item>
                    ))}
                  </Select.Popup>
                </Select.Root>
                <Field.Error />
              </Field.Root>

              <Field.Root name="use_case">
                <Field.Label className="text-text-tertiary">활용 목적<Field.Optional>(선택)</Field.Optional></Field.Label>
                <Textarea
                  className={INPUT_COLOR_CLASS}
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="어떤 업무에 위성 데이터를 활용하고 싶으신가요?"
                  rows={3}
                />
              </Field.Root>

              <Field.Root name="budget">
                <Field.Label className="text-text-tertiary">예상 연간 예산<Field.Optional>(선택)</Field.Optional></Field.Label>
                <Select.Root<string | null>
                  items={BUDGET_ITEMS}
                  value={budget || null}
                  onValueChange={(v) => setBudget(v ?? '')}
                >
                  <Select.Trigger className={SELECT_TRIGGER_COLOR_CLASS}>
                    <Select.Value placeholder={BUDGET_OPTIONS[0].label} />
                  </Select.Trigger>
                  <Select.Popup>
                    {BUDGET_ITEMS.map((opt) => (
                      <Select.Item key={opt.label} value={opt.value}>{opt.label}</Select.Item>
                    ))}
                  </Select.Popup>
                </Select.Root>
              </Field.Root>
            </Form>

            {/* 서버/네트워크 오류 — 특정 필드에 속하지 않는 메시지 (NDS 에 인라인 Alert 컴포넌트 없음) */}
            {error && (
              <p role="alert" className="text-body-sm-regular text-status-danger">
                {error}
              </p>
            )}

            <Dialog.SubDescription className="text-text-tertiary">입력하신 정보는 서비스 안내 목적으로만 사용됩니다.</Dialog.SubDescription>
            <Dialog.Footer>
              <Dialog.Cancel className={CANCEL_COLOR_CLASS}>취소</Dialog.Cancel>
              <Dialog.Action className={ACTION_COLOR_CLASS} type="submit" form={FORM_ID} loading={submitting}>
                리포트 요청하기
              </Dialog.Action>
            </Dialog.Footer>
          </>
        )}
      </Dialog.Popup>
    </Dialog.Root>
  );
}
