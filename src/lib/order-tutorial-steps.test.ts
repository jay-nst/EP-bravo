import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  CHOICE_STEP,
  ARCHIVE_STEPS,
  TASKING_STEPS,
  TRACK_STEPS,
  MODAL_STEP,
  EXAMPLE_STRIPS,
  CAPTURE_BASE,
  px,
  type StageRect,
} from './order-tutorial-steps';

// 설계문서(docs/ORDER_TUTORIAL_PROPOSAL_DESIGN.md)의 스텝 계약을 검증한다.

const inBounds = (r: StageRect) =>
  r.x >= 0 && r.y >= 0 && r.w > 0 && r.h > 0 && r.x + r.w <= 100.001 && r.y + r.h <= 100.001;

const contains = (outer: StageRect, inner: StageRect) =>
  inner.x >= outer.x - 0.001 &&
  inner.y >= outer.y - 0.001 &&
  inner.x + inner.w <= outer.x + outer.w + 0.001 &&
  inner.y + inner.h <= outer.y + outer.h + 0.001;

const allSteps = [CHOICE_STEP, ...ARCHIVE_STEPS, ...TASKING_STEPS];

describe('order-tutorial-steps', () => {
  it('px 는 1600×1000 실측 px 를 % 로 바꾼다', () => {
    expect(px(16, 188, 340, 256)).toEqual({ x: 1, y: 18.8, w: 21.25, h: 25.6 });
    expect(px(0, 0, 1600, 1000)).toEqual({ x: 0, y: 0, w: 100, h: 100 });
  });

  // Agent 튜토리얼의 소프트 상한(6스텝)과 같다 — 분기·가입 모달을 빼고 트랙당 6개.
  // 진행 표시는 분기 + 6 + 가입 = 8칸. 더 늘면 완주율 벤치마크(6-8스텝 25%)로 다시 합친다.
  it('트랙마다 스텝은 6개 이하이고 두 트랙 길이가 같다', () => {
    expect(ARCHIVE_STEPS.length).toBeLessThanOrEqual(6);
    expect(TASKING_STEPS.length).toBeLessThanOrEqual(6);
    expect(ARCHIVE_STEPS.length).toBe(TASKING_STEPS.length);
    expect(TRACK_STEPS.archive).toBe(ARCHIVE_STEPS);
    expect(TRACK_STEPS.tasking).toBe(TASKING_STEPS);
  });

  it('id 는 두 트랙과 분기를 통틀어 중복이 없다 (driver 타겟 #ot-hotspot-{id})', () => {
    const ids = [...allSteps.map((s) => s.id), MODAL_STEP.id];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('분기는 Archive / Tasking 두 탭이고, 탭 위치는 분기 하이라이트 안에 있다', () => {
    expect(CHOICE_STEP.options.map((o) => o.track)).toEqual(['archive', 'tasking']);
    for (const o of CHOICE_STEP.options) {
      expect(inBounds(o.rect)).toBe(true);
      expect(contains(CHOICE_STEP.hotspot, o.rect)).toBe(true);
    }
  });

  it('모든 핫스팟은 캡쳐 안에 있고, 진행 버튼은 하이라이트 영역 안에 있다', () => {
    for (const s of allSteps) {
      expect(inBounds(s.hotspot), s.id).toBe(true);
    }
    for (const s of [...ARCHIVE_STEPS, ...TASKING_STEPS]) {
      if (s.advanceHotspot) expect(contains(s.hotspot, s.advanceHotspot), s.id).toBe(true);
      if (s.effect) expect(inBounds(s.effect.rect), s.id).toBe(true);
    }
  });

  it('캡쳐 파일이 public 에 실제로 있다', () => {
    const files = new Set<string>([CHOICE_STEP.capture]);
    for (const s of [...ARCHIVE_STEPS, ...TASKING_STEPS]) {
      files.add(s.capture);
      s.framesAfter?.forEach((f) => files.add(f.capture));
    }
    for (const f of files) {
      expect(f.startsWith(`${CAPTURE_BASE}/`)).toBe(true);
      expect(existsSync(path.join(process.cwd(), 'public', f)), f).toBe(true);
    }
  });

  it('모든 스텝은 title·body 카피를 가지고, 클릭 스텝은 무엇을 누를지 라벨이 있다', () => {
    for (const s of [...allSteps, MODAL_STEP]) {
      expect(s.title.trim().length).toBeGreaterThan(0);
      expect(s.body.trim().length).toBeGreaterThan(0);
    }
    for (const s of [...ARCHIVE_STEPS, ...TASKING_STEPS]) {
      if (s.action === 'click') expect(s.advanceLabel, s.id).toBeTruthy();
    }
  });

  // 재현 레이어 계약: 위젯 모드가 실서비스 순서(궤도 → 하단 바 → 시트 → 동의)로 이어지고,
  // 바로 앞 스텝(시뮬레이션 확인하기)이 대기 연출을 가진다. 스텝을 재배열할 때 유실 방지.
  it('Tasking 재현 레이어 모드는 orbits → selected → sheet → agreed 순서다', () => {
    const widgets = TASKING_STEPS.filter((s) => s.widget).map((s) => s.widget);
    expect(widgets).toEqual(['orbits', 'selected', 'sheet', 'agreed']);
    const first = TASKING_STEPS.findIndex((s) => s.widget === 'orbits');
    expect(TASKING_STEPS[first - 1].effect?.kind).toBe('sim-loading');
    expect(ARCHIVE_STEPS.some((s) => s.widget)).toBe(false);
  });

  it('Archive 첫 스텝은 영역 그리기 연출, Tasking 첫 스텝은 지점 핑 연출을 가진다', () => {
    expect(ARCHIVE_STEPS[0].effect).toMatchObject({ kind: 'draw-aoi', at: 'before' });
    expect(TASKING_STEPS[0].effect).toMatchObject({ kind: 'drop-pin', at: 'after' });
  });

  // 예시 궤도는 실측이 아니다 — 캡쳐일(2026-10-08) 이후의 미래 일정이어야 '촬영 가능 일정'으로 읽힌다
  it('예시 궤도는 캡쳐일 이후 일정이고 값이 실서비스 표시 범위 안에 있다', () => {
    expect(EXAMPLE_STRIPS.length).toBeGreaterThan(0);
    for (const s of EXAMPLE_STRIPS) {
      expect(new Date(s.startTime).getTime()).toBeGreaterThan(Date.UTC(2026, 9, 8));
      expect(s.cloudProbability).toBeGreaterThanOrEqual(0);
      expect(s.cloudProbability).toBeLessThanOrEqual(100);
      expect(Math.abs(s.rollTiltAngle)).toBeLessThanOrEqual(45); // 고급 옵션 Roll 한계
      expect(Math.abs(s.pitchTiltAngle)).toBeLessThanOrEqual(30); // Pitch 한계
    }
  });
});
