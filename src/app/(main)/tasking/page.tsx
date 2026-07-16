'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';

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

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  received: { text: '접수됨', color: 'var(--warning)' },
  reviewing: { text: '검토중', color: 'var(--accent)' },
  quoted: { text: '견적 발송', color: 'var(--secondary)' },
  accepted: { text: '수락됨', color: 'var(--success)' },
  rejected: { text: '거절됨', color: 'var(--error)' },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const inputStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>
          촬영 요청
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm rounded-lg transition-colors"
          style={{ background: 'var(--accent)', color: '#0E0E10' }}
        >
          {showForm ? '취소' : '+ 새 요청'}
        </button>
      </div>

      {success && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{
            background: 'rgba(74, 158, 107, 0.15)',
            border: '1px solid rgba(74, 158, 107, 0.3)',
            color: 'var(--success)',
          }}
        >
          촬영 요청이 접수되었습니다. 검토 후 연락드리겠습니다.
        </div>
      )}

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{
            background: 'rgba(196, 92, 74, 0.15)',
            border: '1px solid rgba(196, 92, 74, 0.3)',
            color: 'var(--error)',
          }}
        >
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl p-6 space-y-4"
          style={{ border: '1px solid var(--border)' }}
        >
          <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
            지도에서 촬영할 영역을 그려주세요. 왼쪽 상단의 폴리곤 도구를 사용하세요.
          </p>

          <div
            className="rounded-lg overflow-hidden"
            style={{ height: '400px', border: '1px solid var(--border)' }}
          >
            <EarthMap
              onAoiChange={setAoi}
              initialStyle="dark"
            />
          </div>

          {aoi && (
            <div
              className="flex items-center justify-between px-4 py-3 rounded-lg"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>면적</span>
                  <p className="text-sm font-mono font-medium" style={{ color: 'var(--text)' }}>
                    {aoi.areaKm2.toLocaleString()} km²
                  </p>
                </div>
                <div
                  className="w-px h-8"
                  style={{ background: 'var(--border)' }}
                />
                <div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>예상 가격</span>
                  <p className="text-sm font-mono font-medium" style={{ color: 'var(--accent)' }}>
                    ${aoi.price.toLocaleString()}
                  </p>
                </div>
              </div>
              {aoi.validationError && (
                <span className="text-xs" style={{ color: 'var(--error)' }}>
                  {aoi.validationError}
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                희망 촬영 시작일
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                희망 촬영 종료일
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              연락처 이메일 *
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              연락처 전화번호
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
              요청 사항
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="촬영 목적, 해상도 요구사항 등"
              className="w-full rounded-lg px-3 py-2 text-sm resize-none focus:outline-none"
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !contactEmail || !aoi || !!aoi.validationError}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#0E0E10' }}
          >
            {submitting ? '제출 중...' : !aoi ? '영역을 먼저 그려주세요' : '촬영 요청 제출'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>로딩 중...</p>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <p className="mb-2" style={{ color: 'var(--text-muted)' }}>촬영 요청 내역이 없습니다</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            새 요청을 만들어 원하는 지역의 위성 촬영을 신청하세요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const status = STATUS_LABELS[req.status] ?? {
              text: req.status,
              color: 'var(--text-muted)',
            };
            return (
              <div
                key={req.id}
                className="rounded-xl p-5 space-y-2"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      요청번호:{' '}
                      <span className="font-mono text-xs" style={{ color: 'var(--text)' }}>
                        {req.id.slice(0, 8)}
                      </span>
                    </p>
                    {(req.preferred_date_from || req.preferred_date_to) && (
                      <p className="text-sm" style={{ color: 'var(--text)' }}>
                        희망 기간: {req.preferred_date_from || '?'} ~{' '}
                        {req.preferred_date_to || '?'}
                      </p>
                    )}
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(req.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <span className="text-sm font-medium" style={{ color: status.color }}>
                    {status.text}
                  </span>
                </div>
                {req.notes && (
                  <p
                    className="text-xs px-3 py-2 rounded"
                    style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
                  >
                    {req.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
