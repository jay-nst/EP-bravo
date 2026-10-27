import { describe, expect, it } from 'vitest';
import {
  DATA_REQUEST_MAILTO,
  KOREA_SECTOR_TARGETS,
  METHANE_NEWS,
  METHANE_REGULATIONS,
  METHANE_RESOURCES,
  PORTAL_OPERATORS,
  PORTAL_SECTIONS,
  PORTAL_STATS,
  PORTAL_UPDATED,
} from './climate-content';

// 메탄 정보 포털 콘텐츠 신뢰 규칙 (설계 결정 3A·7): 실제 기사, 출처 표기, 미래 날짜 없음
const toTime = (d: string) => new Date(d.replace(/\./g, '-')).getTime();

describe('메탄 포털 콘텐츠', () => {
  it('최종 업데이트 날짜는 YYYY.MM.DD 형식이다', () => {
    expect(PORTAL_UPDATED).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });

  it('뉴스는 4건 이상이고 발행일이 최종 업데이트보다 늦지 않다', () => {
    expect(METHANE_NEWS.length).toBeGreaterThanOrEqual(4);
    for (const n of METHANE_NEWS) {
      expect(n.date).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
      expect(toTime(n.date)).toBeLessThanOrEqual(toTime(PORTAL_UPDATED));
    }
  });

  it('뉴스는 최신순이다', () => {
    const times = METHANE_NEWS.map((n) => toTime(n.date));
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it('외부 링크는 모두 https 원문 URL 이고 중복이 없다', () => {
    const hrefs = [...METHANE_NEWS, ...PORTAL_STATS, ...METHANE_RESOURCES].map((x) => x.href);
    for (const h of hrefs) expect(h).toMatch(/^https:\/\//);
    const newsHrefs = METHANE_NEWS.map((n) => n.href);
    expect(new Set(newsHrefs).size).toBe(newsHrefs.length);
  });

  it('수치 카드는 기준과 출처를 함께 가진다', () => {
    for (const st of PORTAL_STATS) {
      expect(st.basis).not.toBe('');
      expect(st.source).not.toBe('');
    }
  });

  it('부문별 감축 목표는 0~100% 범위다', () => {
    for (const t of KOREA_SECTOR_TARGETS) {
      expect(t.value).toBeGreaterThan(0);
      expect(t.value).toBeLessThanOrEqual(100);
    }
  });

  it('폐지된 미국 메탄 부과금 금액을 현행처럼 싣지 않는다', () => {
    expect(METHANE_REGULATIONS.some((r) => r.value.includes('$1,500'))).toBe(false);
  });

  it('섹션 id 는 중복이 없다', () => {
    const ids = PORTAL_SECTIONS.map((sec) => sec.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('데이터 요청 메일에 항목 템플릿이 들어간다', () => {
    const body = decodeURIComponent(DATA_REQUEST_MAILTO.split('body=')[1]);
    expect(body).toContain('기관명');
    expect(body).toContain('활용 목적');
  });

  it('운영 주체는 협의 전까지 나라스페이스만 표기한다', () => {
    expect(PORTAL_OPERATORS).toEqual(['나라스페이스']);
  });
});
