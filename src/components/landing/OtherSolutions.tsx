'use client';

import Link from 'next/link';
import { Card } from '@naraspace-technology/nds/components';

// color = 플랫폼 색 — 마크(점)와 이름 글자 (운영 색, §8)
const SOLUTIONS = [
  { key: 'citadel', label: 'Citadel', desc: '재난 · 도시 관제', color: '#C45C4A', href: '/citadel' },
  { key: 'predict', label: 'Predict', desc: '자산 검증 · 금융', color: '#4A9EC4', href: '/predict' },
  { key: 'warden', label: 'Warden', desc: '기후 · 컴플라이언스', color: '#6B8A5E', href: '/warden' },
  { key: 'northpaper', label: 'Northpaper', desc: '국방 · 안보', color: '#3D5A80', href: '/northpaper' },
  { key: 'nexus', label: 'Nexus', desc: '데이터 마켓', color: '#C8923A', href: '/nexus' },
] as const;

interface OtherSolutionsProps {
  /** 현재 페이지의 솔루션 — 목록에서 제외. 솔루션 페이지가 아니면 생략 */
  current?: typeof SOLUTIONS[number]['key'];
}

export default function OtherSolutions({ current }: OtherSolutionsProps) {
  const others = SOLUTIONS.filter((s) => s.key !== current);

  return (
    <section className="max-w-960 mx-auto px-16 md:px-24 pb-48 md:pb-80">
      <div className="border-t border-border-tertiary pt-32">
        {/* eyebrow 라벨 → 진짜 h2 섹션 제목 (§7-1) */}
        <h2 className="mb-16 text-heading-2xl text-text-tertiary">
          EarthPaper의 다른 솔루션
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-12">
          {others.map((s) => (
            <Card.Root
              key={s.key}
              interactive
              className="bg-bg-secondary hover:bg-bg-secondary hover:inset-ring-border-tertiary"
              render={<Link href={s.href} />}
            >
              <Card.Body className="gap-4">
                <Card.Title className="flex items-center gap-8" style={{ color: s.color }}>
                  <span className="w-8 h-8 rounded-full shrink-0" style={{ background: s.color }} />
                  {s.label}
                </Card.Title>
                <p className="text-body-xs-regular text-text-tertiary">{s.desc}</p>
              </Card.Body>
            </Card.Root>
          ))}
        </div>
      </div>
    </section>
  );
}
