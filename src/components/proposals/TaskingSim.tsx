'use client';

import { useEffect, useState } from 'react';
import { Collapsible } from '@base-ui/react/collapsible';
import { Button, Checkbox, Field, Select, Separator, Skeleton } from '@naraspace-technology/nds/components';
import { IconChevronDown, IconCloud } from '@naraspace-technology/nds/icons';
import {
  CAPTURE_WIDTH,
  CAPTURE_HEIGHT,
  EXAMPLE_STRIPS,
  TASKING_PRICE_PER_SCENE,
  type ExampleStrip,
  type TaskingWidget,
} from '@/lib/order-tutorial-steps';

// Tasking 시뮬레이션 이후 화면 재현 — 캡쳐 시점 실서비스 궤도 조회가 빈 결과
// ({"assignedOrbitInfoList":[]})라 실화면을 찍을 수 없었다. 마크업·클래스·문구는
// map.ep.naraspace.com 번들(모듈 625473 사이드바, 622918 하단 바, 310665 구매 시트,
// 397660 지도 레이어·타이머)을 그대로 옮겼고, 궤도 값만 예시(EXAMPLE_STRIPS)다.
//
// 좌표: 캡쳐 원본 1600×1000 px 로 그린 뒤 스테이지 폭에 맞춰 scale 한다 — NDS
// 컴포넌트가 실서비스와 같은 px 로 렌더돼 캡쳐 속 헤더와 이어진다.
// 색: .ep-live-light 가 NDS 토큰 변수를 실서비스 라이트 값으로 다시 선언한다
// (EarthPaper 앱은 .dark 고정이지만 실서비스 화면은 라이트다).

export type TaskingSimMode = TaskingWidget | 'loading';

const SIDEBAR_W = 372;
const LIST_TOP = 420; // 헤더(고급 옵션 + 상품 카드, py-20) 바로 아래 — 캡쳐 실측
const MAP_LEFT = 372;
const MAP_TOP = 56;

// 실서비스 formatters (모듈 478880)
const pad = (n: number) => String(n).padStart(2, '0');
function formatUtcDate(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())}`;
}
function formatUtcHourMinute(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}
const nf2 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
function formatAngle(v: number) {
  return `${nf2.format(Math.ceil(Number((100 * v).toFixed(6))) / 100)}°`;
}
function formatPrice(v: number) {
  return `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}`;
}

interface TaskingSimProps {
  mode: TaskingSimMode;
  scale: number;
  /** 지도 미리보기(카드 본문 클릭) 중인 예시 궤도 — 지도 레이어와 공유 */
  previewId: string | null;
  onPreview: (icpId: string | null) => void;
  /** 체크된(구매 대상) 예시 궤도 */
  orderId: string | null;
  onOrder: (icpId: string) => void;
  onBuy: () => void;
  onAgree: () => void;
  onPay: () => void;
}

export default function TaskingSim({
  mode,
  scale,
  previewId,
  onPreview,
  orderId,
  onOrder,
  onBuy,
  onAgree,
  onPay,
}: TaskingSimProps) {
  const order = EXAMPLE_STRIPS.find((s) => s.icpId === orderId) ?? null;
  const showSheet = mode === 'sheet' || mode === 'agreed';
  const showBar = mode === 'selected' && order !== null;

  return (
    <div
      className="ep-live-light absolute left-0 top-0 origin-top-left"
      style={{ width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT, transform: `scale(${scale})`, pointerEvents: 'none' }}
      aria-label="Tasking 시뮬레이션 결과 (예시 일정)"
    >
      {/* 결과가 있으면 같은 조건의 재시뮬레이션은 막힌다 (sameAsLastRequest) */}
      <div className="absolute" style={{ left: 32, top: 352, width: 308 }}>
        <Button size="sm" display="block" loading={mode === 'loading'} disabled={mode !== 'loading'}>
          시뮬레이션 확인하기
        </Button>
      </div>

      <div
        className="absolute flex flex-col overflow-hidden bg-bg-primary"
        style={{ left: 0, top: LIST_TOP, width: SIDEBAR_W, height: CAPTURE_HEIGHT - LIST_TOP }}
      >
        <div className="flex flex-col gap-8 px-16 py-12">
          {mode === 'loading' ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <p className="text-body-xs-regular text-text-tertiary">예시 일정입니다. 실제 위성 궤도가 아닙니다.</p>
              {EXAMPLE_STRIPS.map((s) => (
                <OrbitCard
                  key={s.icpId}
                  strip={s}
                  isPreview={previewId === s.icpId}
                  isOrder={orderId === s.icpId}
                  interactive={mode === 'orbits'}
                  onPreview={() => onPreview(previewId === s.icpId ? null : s.icpId)}
                  onOrder={() => {
                    onPreview(s.icpId);
                    onOrder(s.icpId);
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {showBar && order && <PurchaseBar onBuy={onBuy} />}
      {showSheet && order && (
        <PurchaseSheet strip={order} agreed={mode === 'agreed'} onAgree={onAgree} onPay={onPay} />
      )}
    </div>
  );
}

// 스켈레톤 카드 (eD) — Strip 모드 1줄
function SkeletonCard() {
  return (
    <div className="flex w-full shrink-0 flex-col rounded-md bg-bg-tertiary p-16 shadow-6">
      <div className="flex items-center gap-8">
        <Skeleton.Item className="size-24 shrink-0 rounded-lg" />
        <Skeleton.Item className="h-28 w-full rounded-md" />
      </div>
      <div className="my-8 flex flex-col gap-8 border-b border-dashed border-border-tertiary pb-7">
        <div className="flex items-center gap-8">
          <Skeleton.Item className="h-24 w-100 rounded-lg" />
          <Skeleton.Item className="h-24 w-100 rounded-lg" />
        </div>
      </div>
      <Skeleton.Item className="h-24 w-100 rounded-lg" />
    </div>
  );
}

// 궤도 카드 (e$) — 카드 본문 클릭 = 지도 미리보기(teal 링), 동그라미 체크 = 구매 대상
function OrbitCard({
  strip,
  isPreview,
  isOrder,
  interactive,
  onPreview,
  onOrder,
}: {
  strip: ExampleStrip;
  isPreview: boolean;
  isOrder: boolean;
  interactive: boolean;
  onPreview: () => void;
  onOrder: () => void;
}) {
  return (
    <div
      data-icp-id={strip.icpId}
      role="button"
      tabIndex={interactive ? 0 : -1}
      onClick={interactive ? onPreview : undefined}
      onKeyDown={(e) => {
        if (!interactive) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPreview();
        }
      }}
      className={[
        'flex w-full shrink-0 cursor-pointer scroll-my-8 flex-col rounded-md bg-bg-tertiary p-16 shadow-6 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-border-focus-ring',
        isPreview ? 'inset-ring inset-ring-border-interactive-primary' : '',
        interactive ? 'ep-advance-btn' : '',
      ].join(' ')}
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
    >
      <Field.Root orientation="horizontal" onClick={(e) => e.stopPropagation()} className="mb-8 w-fit cursor-default">
        <Field.Control>
          <Checkbox
            checked={isOrder}
            onCheckedChange={(c) => {
              if (c) onOrder();
            }}
            className={`rounded-full ${interactive ? 'ep-advance-btn ep-advance-pulse' : ''}`}
          />
        </Field.Control>
        <Field.Label className="text-body-md-medium">{formatUtcDate(strip.startTime)}</Field.Label>
      </Field.Root>

      <div className="mb-8 flex items-center gap-8 border-b border-dashed border-border-tertiary pb-7">
        <span className="min-w-0 flex-1 text-body-sm-medium text-text-primary">{formatUtcHourMinute(strip.startTime)}</span>
        <div className="flex shrink-0 items-center gap-4">
          <IconCloud className="size-24 shrink-0" />
          <span className="text-body-sm-regular whitespace-nowrap text-text-primary">
            흐릴 확률 {Math.round(strip.cloudProbability)}%
          </span>
        </div>
      </div>

      {/* 실서비스와 같이 Base UI Collapsible 에 NDS Button 을 render 로 넘긴다
          (NDS Collapsible.Trigger 는 자체 라벨·아이콘을 그려 셰브론이 겹친다) */}
      <Collapsible.Root className="flex flex-col">
        <Collapsible.Trigger
          onClick={(e) => e.stopPropagation()}
          render={
            <Button
              size="sm"
              variant="text"
              className={`group justify-start ${interactive ? 'ep-advance-btn' : ''}`}
              rightIcon={<IconChevronDown className="transition-transform group-data-panel-open:rotate-180" />}
            />
          }
        >
          상세정보
        </Collapsible.Trigger>
        <Collapsible.Panel className="h-(--collapsible-panel-height) overflow-hidden transition-[height] data-ending-style:h-0 data-starting-style:h-0">
          <div className="flex flex-col pt-12">
            <div className="flex items-center gap-6 text-body-xs-regular text-text-interactive-secondary">
              <span className="min-w-0 flex-1 opacity-60">Roll Angle</span>
              <span className="min-w-0 flex-1 opacity-60">Pitch Angle</span>
              <span className="min-w-0 flex-1 opacity-60">Sun Elevation</span>
            </div>
            <Separator className="mt-3 mb-4 bg-border-tertiary" />
            <div className="flex items-center gap-6 text-body-sm-regular text-text-primary">
              <span className="min-w-0 flex-1">{formatAngle(strip.rollTiltAngle)}</span>
              <span className="min-w-0 flex-1">{formatAngle(strip.pitchTiltAngle)}</span>
              <span className="min-w-0 flex-1">{formatAngle(strip.sunElevation)}</span>
            </div>
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}

// 사이드바 바닥 셸 (251106) — 하단 바와 구매 시트가 같은 자리를 쓴다
function BottomShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute bottom-0 left-0 w-full shrink-0 bg-bg-tertiary" style={{ width: SIDEBAR_W }}>
      <div className="isolate size-full rounded-t-md bg-bg-tertiary p-16 shadow-8">{children}</div>
    </div>
  );
}

// 하단 구매 바 (622918) — Tasking 은 면적 대신 장면 수
function PurchaseBar({ onBuy }: { onBuy: () => void }) {
  return (
    <BottomShell>
      <div className="flex items-center justify-between border-b border-dashed border-border-tertiary pb-11">
        <p className="text-body-sm-medium text-text-interactive-secondary">1 Scene</p>
        <div className="flex items-center gap-12">
          <p className="text-heading-lg">{formatPrice(TASKING_PRICE_PER_SCENE)}</p>
          <Button
            size="sm"
            onClick={onBuy}
            className="bg-bg-interactive-primary-hover ep-advance-btn ep-advance-pulse"
            style={{ pointerEvents: 'auto' }}
          >
            구매하기
          </Button>
        </div>
      </div>
      <div className="pt-12 text-center text-body-sm-regular">
        다건·맞춤형 구매는 <span className="text-status-info underline">별도 문의</span>해 주세요.
      </div>
    </BottomShell>
  );
}

// 구매 시트 (310665)
function PurchaseSheet({
  strip,
  agreed,
  onAgree,
  onPay,
}: {
  strip: ExampleStrip;
  agreed: boolean;
  onAgree: () => void;
  onPay: () => void;
}) {
  return (
    <BottomShell>
      <div className="flex flex-col">
        <div className="flex flex-col items-center gap-8">
          <Button iconOnly size="sm" variant="text" className="w-full" aria-label="닫기" tabIndex={-1}>
            <IconChevronDown />
          </Button>
          <div className="mb-12 flex w-full flex-col gap-2 border-b border-dashed border-border-tertiary pb-11">
            <span className="text-heading-lg">SpaceEye-T (Assured)</span>
            <div className="flex gap-8 text-body-sm-medium whitespace-nowrap text-text-interactive-secondary">
              <span>{formatUtcDate(strip.startTime)}</span>
              <span>초고해상도</span>
              <span>1 Scene</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-12">
          <span className="text-body-sm-regular text-text-interactive-secondary">결제 금액</span>
          <span className="text-heading-lg">{formatPrice(TASKING_PRICE_PER_SCENE)}</span>
        </div>
        <Field.Root className="mt-11 border-t border-dashed border-border-tertiary pt-12">
          <Field.Label size="sm" className="text-text-interactive-secondary">
            기하 보정 수준
          </Field.Label>
          <Select.Root<string> items={GEOMETRIC_CORRECTION} value="ORT">
            <Select.Trigger tabIndex={-1}>
              <Select.Value />
            </Select.Trigger>
            <Select.Popup>
              {GEOMETRIC_CORRECTION.map((g) => (
                <Select.Item key={g.value} value={g.value}>
                  {g.label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Root>
        </Field.Root>
        <div className="mt-12 flex items-start justify-between gap-6 rounded-sm border border-border-tertiary bg-bg-secondary p-7">
          <Field.Root orientation="horizontal">
            <Field.Control>
              <Checkbox
                checked={agreed}
                onCheckedChange={(c) => {
                  if (c) onAgree();
                }}
                className={agreed ? '' : 'ep-advance-btn ep-advance-pulse'}
                style={{ pointerEvents: agreed ? 'none' : 'auto' }}
              />
            </Field.Control>
            <Field.Label size="sm">구매 전 안내 사항을 확인하였습니다.</Field.Label>
          </Field.Root>
          <Button size="sm" variant="text" className="text-status-info" tabIndex={-1}>
            보기
          </Button>
        </div>
        <Button
          variant="solid"
          display="block"
          disabled={!agreed}
          onClick={onPay}
          className={`mt-12 bg-bg-interactive-primary-hover ${agreed ? 'ep-advance-btn ep-advance-pulse' : ''}`}
          style={{ pointerEvents: agreed ? 'auto' : 'none' }}
        >
          결제하기
        </Button>
      </div>
    </BottomShell>
  );
}

const GEOMETRIC_CORRECTION = [
  { value: 'SEN', label: 'SEN (방사보정)' },
  { value: 'PRJ', label: 'PRJ (기하보정)' },
  { value: 'ORT', label: 'ORT (정사보정)' },
];

// ---------------------------------------------------------------------------
// 지도 레이어 — 궤도 경로·촬영 범위·5분 타이머 (397660). 투어 오버레이 위에 떠야
// 해서 데모가 portal 로 띄운다. 좌표는 지도 영역(1228×944) 로컬 px.
// 궤도 기하는 예시다: 캡쳐 속 지점(985,478 → 로컬 613,422)을 덮도록 하강
// 궤도 방향(남남서)으로 배치했다. 색은 실서비스 TASKING_DRAW_COLOR 그대로.
// ---------------------------------------------------------------------------

const POINT = { x: 985 - MAP_LEFT, y: 478 - MAP_TOP };
const DIR = norm({ x: -0.2, y: 1 }); // 진행 방향 (북 → 남남서)
const NRM = { x: DIR.y, y: -DIR.x }; // 진행 방향의 수직
const SWATH = 300; // 12 km × 25 px/km (캡쳐 축척 3 km ≈ 76 px)
const STRIP_LEN = 420;

// 궤도별: 촬영 범위 중심의 수직/진행 방향 오프셋, 궤도 경로의 수직 오프셋 (롤 각에 비례)
const ORBIT_GEOMETRY: Record<string, { across: number; along: number; path: number }> = {
  'example-1': { across: 40, along: -30, path: -230 },
  'example-2': { across: -70, along: 50, path: 330 },
  'example-3': { across: 90, along: 10, path: -470 },
};

function norm(v: { x: number; y: number }) {
  const l = Math.hypot(v.x, v.y);
  return { x: v.x / l, y: v.y / l };
}
const add = (a: { x: number; y: number }, b: { x: number; y: number }, k = 1) => ({ x: a.x + b.x * k, y: a.y + b.y * k });

function stripGeometry(icpId: string) {
  const g = ORBIT_GEOMETRY[icpId];
  const c = add(add(POINT, NRM, g.across), DIR, g.along);
  const h = STRIP_LEN / 2;
  const w = SWATH / 2;
  const corners = [
    add(add(c, DIR, -h), NRM, -w),
    add(add(c, DIR, -h), NRM, w),
    add(add(c, DIR, h), NRM, w),
    add(add(c, DIR, h), NRM, -w),
  ];
  const pc = add(c, NRM, g.path);
  return {
    footprint: corners.map((p) => `${p.x},${p.y}`).join(' '),
    path: [add(pc, DIR, -1400), add(pc, DIR, 1400)],
    imaging: [add(pc, DIR, -h), add(pc, DIR, h)],
  };
}

export function TaskingMapLayer({ previewId, showTimer }: { previewId: string | null; showTimer: boolean }) {
  const width = CAPTURE_WIDTH - MAP_LEFT;
  const height = CAPTURE_HEIGHT - MAP_TOP;
  // 선택한 궤도를 맨 위에 그린다 (실서비스 selected 레이어 순서)
  const ordered = [...EXAMPLE_STRIPS].sort((a, b) => Number(a.icpId === previewId) - Number(b.icpId === previewId));

  return (
    <div className="ep-live-light absolute" style={{ left: MAP_LEFT, top: MAP_TOP, width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="absolute inset-0">
        {ordered.map((s) => {
          const g = stripGeometry(s.icpId);
          const sel = s.icpId === previewId;
          return (
            <g key={s.icpId}>
              <polygon
                points={g.footprint}
                fill={sel ? 'rgba(96, 231, 211, 0.5)' : 'rgba(182, 185, 191, 0.3)'}
                stroke={sel ? '#1ED2B9' : '#9CA0A6'}
                strokeWidth={2}
              />
              <line
                x1={g.path[0].x}
                y1={g.path[0].y}
                x2={g.path[1].x}
                y2={g.path[1].y}
                stroke={sel ? '#35D9C0' : '#5F636B'}
                strokeWidth={2}
                strokeDasharray={sel ? undefined : '8 6'}
              />
              <line
                x1={g.imaging[0].x}
                y1={g.imaging[0].y}
                x2={g.imaging[1].x}
                y2={g.imaging[1].y}
                stroke={sel ? '#35D9C0' : '#5F636B'}
                strokeWidth={10}
              />
            </g>
          );
        })}
      </svg>
      {showTimer && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2">
          <TimerPill />
        </div>
      )}
    </div>
  );
}

// 5분 타이머 (397660) — 122×42 알약, 민트 테두리가 300초 동안 줄어든다.
// 데모에서는 00:00 이 돼도 만료 다이얼로그를 띄우지 않고 멈춘다.
function TimerPill() {
  const [remaining, setRemaining] = useState(300);
  useEffect(() => {
    const started = Date.now();
    const t = setInterval(() => {
      setRemaining(Math.max(300 - Math.floor((Date.now() - started) / 1000), 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const d = 'M 61 1 L 101 1 A 20 20 0 0 1 101 41 L 21 41 A 20 20 0 0 1 21 1 Z';
  return (
    <div style={{ width: 122, height: 42 }} className="relative flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-bg-tertiary shadow-8" />
      <svg fill="none" width={122} height={42} viewBox="0 0 122 42" className="absolute inset-0">
        <path d={d} strokeWidth={2} className="stroke-border-secondary" />
        <path
          d={d}
          pathLength={100}
          strokeDasharray={100}
          strokeLinecap="round"
          strokeWidth={2}
          className={`ep-timer-stroke stroke-border-interactive-primary ${remaining === 0 ? 'opacity-0' : ''}`}
        />
      </svg>
      <span className="relative text-body-md-medium text-text-primary">
        {pad(Math.floor(remaining / 60))}:{pad(remaining % 60)}
      </span>
    </div>
  );
}
