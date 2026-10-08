'use client';

import { useState } from 'react';
import { Button, Dialog, Field, Input, Select, Textarea } from '@naraspace-technology/nds/components';
import { IconCheckCircle, IconX } from '@naraspace-technology/nds/icons';
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

// NDS 참조 구현 (2단계 #1) — Dialog + Field/Input/Select/Textarea + Button.
// 이후 폼·모달 교체는 이 파일의 패턴을 따른다 (CLAUDE.md "참조 패턴").
//  - 열림/닫힘: Dialog.Root open + onOpenChange(false → onClose). 스크롤 잠금·Esc·바깥 클릭은 Base UI 가 처리
//  - 필드: Field.Root > Field.Label(+Required/Optional) > 컨트롤. 라벨-컨트롤 연결도 Field 가 처리
//  - Select: '' (미선택) ↔ null. "선택 안 함" 같은 해제 항목은 value null 인 item
//  - 버튼: NDS 기본 solid (강조 CTA 도 동일 — docs/NDS_MIGRATION.md 2단계 결정)
const ROLE_ITEMS = ROLE_OPTIONS.filter((o) => o.value);
const BUDGET_ITEMS = BUDGET_OPTIONS.map((o) => ({ value: o.value || null, label: o.label }));

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

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <Dialog.Popup className="max-h-[calc(100vh-32px)] overflow-y-auto">
        {submitted ? (
          <div className="flex flex-col items-center gap-8 py-24 text-center">
            <IconCheckCircle className="size-48" style={{ color: accentColor }} aria-hidden />
            <Dialog.Title>등록 완료</Dialog.Title>
            <Dialog.Description className="text-text-secondary">
              관심을 가져주셔서 감사합니다.<br />
              담당자가 빠르게 연락드리겠습니다.
            </Dialog.Description>
            <Dialog.Footer className="w-full pt-16">
              <Dialog.Close render={<Button variant="solid" size="md" display="block" />}>닫기</Dialog.Close>
            </Dialog.Footer>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-12">
              <div className="flex flex-col gap-4">
                <p className="font-mono text-body-xs-regular uppercase tracking-[0.08em]" style={{ color: accentColor }}>
                  {VERTICAL_LABELS[vertical]}
                </p>
                <Dialog.Title>상세 리포트 요청</Dialog.Title>
              </div>
              <Dialog.Close render={<Button variant="text" size="sm" iconOnly aria-label="닫기" />}>
                <IconX />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-16" noValidate>
              <Field.Root>
                <Field.Label>이름<Field.Required /></Field.Label>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" />
              </Field.Root>

              <Field.Root>
                <Field.Label>이메일<Field.Required /></Field.Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hong@company.com" />
              </Field.Root>

              <Field.Root>
                <Field.Label>소속<Field.Required /></Field.Label>
                <Input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="회사 또는 기관명" />
              </Field.Root>

              <Field.Root>
                <Field.Label>담당 분야<Field.Required /></Field.Label>
                <Select.Root<string | null>
                  items={ROLE_ITEMS}
                  value={role || null}
                  onValueChange={(v) => setRole(v ?? '')}
                >
                  <Select.Trigger>
                    <Select.Value placeholder={ROLE_OPTIONS[0].label} />
                  </Select.Trigger>
                  <Select.Popup>
                    {ROLE_ITEMS.map((opt) => (
                      <Select.Item key={opt.value} value={opt.value}>{opt.label}</Select.Item>
                    ))}
                  </Select.Popup>
                </Select.Root>
              </Field.Root>

              <Field.Root>
                <Field.Label>활용 목적<Field.Optional>(선택)</Field.Optional></Field.Label>
                <Textarea
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="어떤 업무에 위성 데이터를 활용하고 싶으신가요?"
                  rows={3}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>예상 연간 예산<Field.Optional>(선택)</Field.Optional></Field.Label>
                <Select.Root<string | null>
                  items={BUDGET_ITEMS}
                  value={budget || null}
                  onValueChange={(v) => setBudget(v ?? '')}
                >
                  <Select.Trigger>
                    <Select.Value placeholder={BUDGET_OPTIONS[0].label} />
                  </Select.Trigger>
                  <Select.Popup>
                    {BUDGET_ITEMS.map((opt) => (
                      <Select.Item key={opt.label} value={opt.value}>{opt.label}</Select.Item>
                    ))}
                  </Select.Popup>
                </Select.Root>
              </Field.Root>

              {error && (
                <p role="alert" className="text-body-sm-regular text-status-danger">
                  {error}
                </p>
              )}

              <Button type="submit" variant="solid" size="lg" display="block" loading={submitting}>
                {submitting ? '제출 중...' : '리포트 요청하기'}
              </Button>

              <p className="text-center text-body-xs-regular text-text-tertiary">
                입력하신 정보는 서비스 안내 목적으로만 사용됩니다.
              </p>
            </form>
          </>
        )}
      </Dialog.Popup>
    </Dialog.Root>
  );
}
