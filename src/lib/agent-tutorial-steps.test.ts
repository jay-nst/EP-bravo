import { describe, it, expect } from 'vitest';
import {
  TUTORIAL_STEPS,
  HIGHLIGHT_STEPS,
  MODAL_STEP,
  CLARITY_METRICS,
  CAPTURE_BASE,
} from './agent-tutorial-steps';

// 설계문서(docs/AGENT_TUTORIAL_PROPOSAL_DESIGN.md) 구현 스펙의 계약을 검증한다.
describe('agent-tutorial-steps', () => {
  // 소프트 상한 5스텝(설계문서 §플로우 — 초과 가능)에서 2026-09-28 피그마 디자인
  // 리뷰로 지도 비교/아티클 열기 스텝을 분리해 6스텝이 됐다. 더 늘면 완주율
  // 벤치마크(6-8스텝 25%)를 근거로 다시 합쳐야 한다.
  it('스텝은 6개 이하를 지킨다 (완주율 근거의 소프트 상한)', () => {
    expect(TUTORIAL_STEPS.length).toBeLessThanOrEqual(6);
    expect(TUTORIAL_STEPS.length).toBeGreaterThanOrEqual(1);
  });

  it('id 는 중복이 없다', () => {
    const ids = TUTORIAL_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('modal 스텝은 정확히 1개이며 마지막 스텝이다 (가입 전환 클라이맥스)', () => {
    const modals = TUTORIAL_STEPS.filter((s) => s.type === 'modal');
    expect(modals).toHaveLength(1);
    expect(TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1].type).toBe('modal');
    expect(MODAL_STEP).toBe(modals[0]);
  });

  it('highlight 스텝은 캡쳐 경로와 유효한 hotspot 을 가진다', () => {
    expect(HIGHLIGHT_STEPS.length).toBeGreaterThan(0);
    for (const s of HIGHLIGHT_STEPS) {
      expect(s.capture.startsWith(`${CAPTURE_BASE}/`)).toBe(true);
      const { x, y, w, h } = s.hotspot;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(w).toBeGreaterThan(0);
      expect(h).toBeGreaterThan(0);
      // % 좌표계 — 캡쳐 밖으로 나가면 하이라이트가 빈 곳을 가리킨다
      expect(x + w).toBeLessThanOrEqual(100);
      expect(y + h).toBeLessThanOrEqual(100);
    }
  });

  it("action 은 'click' | 'next' 두 값만 허용한다", () => {
    for (const s of HIGHLIGHT_STEPS) {
      expect(['click', 'next']).toContain(s.action);
    }
  });

  it('모든 스텝은 title 과 body 카피를 가진다', () => {
    for (const s of TUTORIAL_STEPS) {
      expect(s.title.trim().length).toBeGreaterThan(0);
      expect(s.body.trim().length).toBeGreaterThan(0);
    }
  });

  // 회귀 방지 (2026-10-07): 스텝 분리 커밋에서 widget: 'compare' 가 유실돼
  // 슬라이더·심각도 패널이 정적 캡쳐로만 보였다. 위젯은 스펙 필드로만 연결되므로
  // (AgentTutorialDemo 는 s.widget === 'compare'/'article' 일 때만 렌더) 여기서 계약을 고정한다.
  it('인터랙티브 위젯 스텝이 스펙에 존재한다 (compare = 지도 비교, article = 아티클 스크롤)', () => {
    const compare = HIGHLIGHT_STEPS.find((s) => s.widget === 'compare');
    expect(compare?.id).toBe('map-compare');
    const article = HIGHLIGHT_STEPS.find((s) => s.widget === 'article');
    expect(article?.id).toBe('analysis-article');
  });

  it('도입부 노출 Clarity 수치는 1-2개다 (수집 3개 중)', () => {
    expect(CLARITY_METRICS).toHaveLength(3);
    const exposed = CLARITY_METRICS.filter((m) => m.exposed);
    expect(exposed.length).toBeGreaterThanOrEqual(1);
    expect(exposed.length).toBeLessThanOrEqual(2);
  });
});
