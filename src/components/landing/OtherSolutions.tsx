'use client';

import Link from 'next/link';
import { Card } from '@naraspace-technology/nds/components';

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
        <span className="block mb-16 text-body-xs-regular text-text-tertiary">
          EarthPaper의 다른 솔루션
        </span>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-10">
          {others.map((s) => (
            <Card.Root key={s.key} interactive render={<Link href={s.href} />}>
              <Card.Body className="flex-row items-center gap-12 px-8 py-6">
                <span className="w-8 h-8 rounded-full shrink-0" style={{ background: s.color }} />
                <div>
                  <span className="block text-body-sm-medium" style={{ color: s.color }}>
                    {s.label}
                  </span>
                  <span className="text-body-xs-regular text-text-tertiary">
                    {s.desc}
                  </span>
                </div>
              </Card.Body>
            </Card.Root>
          ))}
        </div>
      </div>
    </section>
  );
}
