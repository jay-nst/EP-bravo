'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Form } from '@base-ui/react/form';
import {
  Button,
  Card,
  Field,
  Input,
  Separator,
  Spinner,
  StatusChip,
  Textarea,
  type StatusChipProps,
} from '@naraspace-technology/nds/components';
import { IconPlus } from '@naraspace-technology/nds/icons';
import { createClient } from '@/lib/supabase/client';
import { fmtNum } from '@/lib/format';

const EarthMap = dynamic(() => import('@/components/map/EarthMap'), { ssr: false });

interface AoiSelection {
  polygon: GeoJSON.Polygon;
  areaKm2: number;
  price: number;
  satellite: string;
  validationError: string | null;
}

interface TaskingRequest {
  id: string;
  status: string;
  contact_email: string;
  preferred_date_from: string | null;
  preferred_date_to: string | null;
  notes: string | null;
  created_at: string;
}

// 요청 상태 → NDS StatusChip status (기존 색 의미: warning·accent·secondary·success·error)
const STATUS_LABELS: Record<string, { text: string; status: StatusChipProps['status'] }> = {
  received: { text: '접수됨', status: 'warning' },
  reviewing: { text: '검토중', status: 'brand' },
  quoted: { text: '견적 발송', status: 'information' },
  accepted: { text: '수락됨', status: 'success' },
  rejected: { text: '거절됨', status: 'error' },
};

export default function TaskingPage() {
  const [requests, setRequests] = useState<TaskingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [aoi, setAoi] = useState<AoiSelection | null>(null);

  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setContactEmail(user.email);
    });
    fetch('/api/tasking')
      .then((r) => r.json())
      .then((data) => {
        if (data.requests) setRequests(data.requests);
      })
      .finally(() => setLoading(false));
  }, []);

  // Form 이 필드 검증(이메일 required·type=email)을 통과시켰을 때만 호출된다
  const handleSubmit = async () => {
    if (!aoi) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/tasking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aoi: aoi.polygon,
          preferredDateFrom: dateFrom || undefined,
          preferredDateTo: dateTo || undefined,
          contactEmail,
          contactPhone: contactPhone || undefined,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '요청 실패');
        return;
      }

      const data = await res.json();
      setRequests((prev) => [data.request, ...prev]);
      setShowForm(false);
      setSuccess(true);
      setAoi(null);
      setTimeout(() => setSuccess(false), 3000);
      setDateFrom('');
      setDateTo('');
      setNotes('');
    } catch {
      setError('네트워크 오류');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-16 py-32">
      <div className="mb-24 flex items-center justify-between">
        <h1 className="text-heading-3xl text-text-primary md:text-display-md">
          촬영 요청
        </h1>
        <Button
          variant={showForm ? 'outline' : 'solid'}
          leftIcon={showForm ? undefined : <IconPlus />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '취소' : '새 요청'}
        </Button>
      </div>

      {success && (
        <div
          role="status"
          className="mb-16 rounded-md bg-status-success-subtle px-16 py-12 text-body-sm-regular text-status-success-bold"
        >
          촬영 요청이 접수되었습니다. 검토 후 연락드리겠습니다.
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-16 rounded-md bg-status-danger-subtle px-16 py-12 text-body-sm-regular text-status-danger-bold"
        >
          {error}
        </div>
      )}

      {showForm && (
        <Form
          onFormSubmit={handleSubmit}
          className="mb-32 flex flex-col gap-16 rounded-lg bg-bg-tertiary p-24 inset-ring-1 inset-ring-border-tertiary"
        >
          <p className="mb-8 text-body-md-regular text-text-secondary">
            지도에서 촬영할 영역을 그려주세요. 왼쪽 상단의 폴리곤 도구를 사용하세요.
          </p>

          {/* 지도가 가장자리까지 차서 inset-ring 대신 border 로 테두리 */}
          <div className="h-400 overflow-hidden rounded-md border border-border-tertiary">
            <EarthMap
              onAoiChange={setAoi}
              initialStyle="dark"
            />
          </div>

          {aoi && (
            <div className="flex items-center justify-between rounded-md bg-bg-secondary px-16 py-12 inset-ring-1 inset-ring-border-tertiary">
              <div className="flex items-center gap-16">
                <div>
                  <span className="text-body-xs-regular text-text-tertiary">면적</span>
                  <p className="text-body-sm-medium tabular-nums text-text-primary">
                    {fmtNum(aoi.areaKm2, 1)} km²
                  </p>
                </div>
                <Separator orientation="vertical" className="h-32" />
                <div>
                  <span className="text-body-xs-regular text-text-tertiary">예상 가격</span>
                  <p className="text-body-sm-medium tabular-nums text-text-primary">
                    ${fmtNum(aoi.price, 2)}
                  </p>
                </div>
              </div>
              {aoi.validationError && (
                <span className="text-body-xs-regular text-status-danger">
                  {aoi.validationError}
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-16">
            <Field.Root name="preferred_date_from">
              <Field.Label>희망 촬영 시작일</Field.Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </Field.Root>
            <Field.Root name="preferred_date_to">
              <Field.Label>희망 촬영 종료일</Field.Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </Field.Root>
          </div>

          {/* 선택 항목이 대부분이라 필수 항목(이메일)에만 Field.Required */}
          <Field.Root name="contact_email">
            <Field.Label>연락처 이메일<Field.Required /></Field.Label>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
            <Field.Error />
          </Field.Root>

          <Field.Root name="contact_phone">
            <Field.Label>연락처 전화번호</Field.Label>
            <Input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="010-0000-0000"
            />
          </Field.Root>

          <Field.Root name="notes">
            <Field.Label>요청 사항</Field.Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="촬영 목적, 해상도 요구사항 등"
            />
          </Field.Root>

          <Button
            type="submit"
            display="block"
            loading={submitting}
            disabled={submitting || !contactEmail || !aoi || !!aoi.validationError}
          >
            {submitting ? '제출 중...' : !aoi ? '영역을 먼저 그려주세요' : '촬영 요청 제출'}
          </Button>
        </Form>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-8 py-32">
          <Spinner size="sm" aria-label="로딩 중" />
          <p className="text-body-md-regular text-text-secondary">로딩 중...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="py-64 text-center">
          <p className="mb-8 text-heading-lg text-text-primary">촬영 요청 내역이 없습니다</p>
          <p className="text-body-md-regular text-text-secondary">
            새 요청을 만들어 원하는 지역의 위성 촬영을 신청하세요
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {requests.map((req) => {
            const status = STATUS_LABELS[req.status] ?? {
              text: req.status,
              status: 'neutral',
            };
            return (
              <Card.Root key={req.id}>
                <Card.Body className="gap-8">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <p className="text-body-sm-regular text-text-secondary">
                        요청번호:{' '}
                        <span className="text-body-sm-medium tabular-nums text-text-primary">
                          {req.id.slice(0, 8)}
                        </span>
                      </p>
                      {(req.preferred_date_from || req.preferred_date_to) && (
                        <p className="text-body-sm-regular tabular-nums text-text-primary">
                          희망 기간: {req.preferred_date_from || '?'} ~{' '}
                          {req.preferred_date_to || '?'}
                        </p>
                      )}
                      <p className="text-body-xs-regular tabular-nums text-text-tertiary">
                        {new Date(req.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <StatusChip status={status.status}>
                      {status.text}
                    </StatusChip>
                  </div>
                  {req.notes && (
                    <p className="rounded-md bg-bg-secondary px-12 py-8 text-body-sm-regular text-text-secondary">
                      {req.notes}
                    </p>
                  )}
                </Card.Body>
              </Card.Root>
            );
          })}
        </div>
      )}
    </div>
  );
}
