import { describe, expect, it } from 'vitest';
import { transformClasses, scaleSpacing } from './nds-codemod.mjs';

const t = (s: string): string => (transformClasses(s) as { out: string }).out;

describe('nds-codemod: spacing ×4', () => {
  it('정수·소수·0', () => {
    expect(scaleSpacing('4')).toBe('16');
    expect(scaleSpacing('1.5')).toBe('6');
    expect(scaleSpacing('0.5')).toBe('2');
    expect(scaleSpacing('2.5')).toBe('10');
    expect(t('p-0 m-0')).toBe('p-0 m-0');
  });

  it('className 문자열 안의 여러 유틸리티', () => {
    expect(t('className="flex gap-2 px-4 py-1.5 mt-0.5"')).toBe('className="flex gap-8 px-16 py-6 mt-2"');
  });

  it('변형 접두사·음수·important', () => {
    expect(t('"md:px-6 hover:mt-1 group-hover:gap-x-3 -mt-1 md:-translate-y-2 !p-2"')).toBe(
      '"md:px-24 hover:mt-4 group-hover:gap-x-12 -mt-4 md:-translate-y-8 !p-8"',
    );
  });

  it('w/h/size/inset/space/max-w 숫자', () => {
    expect(t("'w-9 h-9 size-4 inset-x-2 top-1 space-y-3 max-w-80'")).toBe(
      "'w-36 h-36 size-16 inset-x-8 top-4 space-y-12 max-w-320'",
    );
  });

  it('분수·키워드·임의값·px 은 건드리지 않는다', () => {
    const s = '"w-1/2 -translate-x-1/2 w-full h-screen max-w-md p-px top-[12px] w-[300px] gap-x-px"';
    expect(t(s)).toBe(s);
  });

  it('비슷한 이름의 다른 유틸리티는 건드리지 않는다', () => {
    const s = '"text-2 z-10 grid-cols-3 col-span-2 border-2 ring-2 opacity-50 duration-200 line-clamp-2 order-1 shadow-6"';
    expect(t(s)).toBe(s);
  });
});

describe('nds-codemod: radius', () => {
  it('Tailwind 기본 → 같은 px 의 NDS 이름', () => {
    expect(t('"rounded rounded-sm rounded-md rounded-lg rounded-xl rounded-2xl rounded-full"')).toBe(
      '"rounded-xs rounded-xs rounded-[6px] rounded-sm rounded-[12px] rounded-md rounded-full"',
    );
  });

  it('방향 + 변형', () => {
    expect(t('"rounded-t md:rounded-tl-lg rounded-b-xl"')).toBe('"rounded-t-xs md:rounded-tl-sm rounded-b-[12px]"');
  });

  it('EP var(--radius-*) → 같은 px', () => {
    expect(t("borderRadius: 'var(--radius-md)'")).toBe("borderRadius: 'var(--radius-sm)'");
    expect(t('border-radius: var(--radius-sm);')).toBe('border-radius: var(--radius-xs);');
    expect(t("borderRadius: 'var(--radius-lg)'")).toBe("borderRadius: '12px'");
  });
});

describe('nds-codemod: 주석은 그대로', () => {
  it('블록·라인·JSX 주석', () => {
    const s = '// Badge: px-8 py-2\n{/* gap-4 rounded-lg */}\n<div className="p-2" />';
    expect(t(s)).toBe('// Badge: px-8 py-2\n{/* gap-4 rounded-lg */}\n<div className="p-8" />');
  });

  it('URL 의 // 는 주석으로 보지 않는다', () => {
    expect(t('<a href="https://x.io" className="px-2">')).toBe('<a href="https://x.io" className="px-8">');
  });
});
