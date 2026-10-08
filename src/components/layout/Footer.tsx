'use client';

import Link from 'next/link';
import { IconArrowUpRight } from '@naraspace-technology/nds/icons';

const PLATFORMS = [
  { label: 'Citadel', desc: '재난 · 도시 관제', color: '#C45C4A', href: '/citadel' },
  { label: 'Predict', desc: '자산 검증 · 금융', color: '#4A9EC4', href: '/predict' },
  { label: 'Warden', desc: '기후 · 컴플라이언스', color: '#6B8A5E', href: '/warden' },
  { label: 'Northpaper', desc: '국방 · 안보', color: '#3D5A80', href: '/northpaper' },
  { label: 'Nexus', desc: '데이터 마켓', color: '#C8923A', href: '/nexus' },
];

const SERVICES = [
  { label: 'Core 지도', href: '/core' },
  { label: 'AI 채팅', href: '/chat' },
  { label: '촬영 요청', href: '/tasking' },
  { label: '내 주문', href: '/portal' },
];

const SUPPORT = [
  { label: '구매 문의', href: 'https://ep.naraspace.com/ko/helpcenter/inquiry?category=purchase', external: true },
  { label: '분석 의뢰', href: 'https://ep.naraspace.com/ko/helpcenter/inquiry?category=analysis', external: true },
  { label: 'EP 매거진', href: 'https://ep.naraspace.com/ko', external: true },
  { label: 'Nara Space', href: 'https://www.naraspace.com/ko', external: true },
];

const SOCIALS = [
  { label: 'LinkedIn', href: 'https://kr.linkedin.com/company/naraspace' },
  { label: 'YouTube', href: 'https://www.youtube.com/@naraspace/featured' },
  { label: 'Instagram', href: 'https://www.instagram.com/naraspace.official/' },
  { label: 'X', href: 'https://twitter.com/naraspacetech' },
];

const LEGAL = [
  { label: '이용약관', href: 'https://ep.naraspace.com/ko/policy/service' },
  { label: '개인정보처리방침', href: 'https://ep.naraspace.com/ko/policy/privacy' },
];

// 대문자 mono eyebrow → NDS body-xs (규칙 1)
const sectionHeaderClass = 'block mb-14 text-body-xs-regular text-text-tertiary';
const listClass = 'flex flex-col gap-8';
const linkClass = 'text-body-sm-regular text-text-tertiary';
const externalLinkClass = 'inline-flex items-center gap-4 text-body-sm-regular text-text-tertiary';

const externalIcon = <IconArrowUpRight className="size-16 text-icon-tertiary opacity-50" />;

export default function Footer() {
  return (
    <footer className="border-t border-border-tertiary bg-bg-secondary">
      <div className="max-w-960 mx-auto px-16 py-32 md:px-24 md:py-48">
        {/* Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-32 mb-48">
          {/* Platforms */}
          <div>
            <span className={sectionHeaderClass}>플랫폼</span>
            <ul className={listClass}>
              {PLATFORMS.map((p) => (
                <li key={p.label}>
                  <Link href={p.href} className="flex items-center gap-8">
                    <span className="size-6 rounded-full shrink-0" style={{ background: p.color }} />
                    <span className="text-body-sm-medium text-text-primary">{p.label}</span>
                    <span className="text-body-xs-regular text-text-tertiary">{p.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <span className={sectionHeaderClass}>서비스</span>
            <ul className={listClass}>
              {SERVICES.map((s) => (
                <li key={s.label}>
                  <Link href={s.href} className={linkClass}>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <span className={sectionHeaderClass}>고객지원</span>
            <ul className={listClass}>
              {SUPPORT.map((r) => (
                <li key={r.label}>
                  {r.external ? (
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={externalLinkClass}
                    >
                      {r.label}
                      {externalIcon}
                    </a>
                  ) : (
                    <Link href={r.href} className={linkClass}>
                      {r.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <span className={sectionHeaderClass}>소셜</span>
            <ul className={listClass}>
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={externalLinkClass}
                  >
                    {s.label}
                    {externalIcon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border-tertiary pt-20 flex items-center justify-between flex-wrap gap-12">
          <div className="flex items-center gap-8">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="6" stroke="var(--text-muted)" strokeWidth="1.5" />
              <ellipse cx="12" cy="12" rx="10" ry="4" stroke="var(--accent)" strokeWidth="1" transform="rotate(-30 12 12)" opacity="0.4" />
            </svg>
            <span className="text-body-xs-regular text-text-tertiary">
              EARTHPAPER
            </span>
          </div>

          <div className="flex items-center gap-16 flex-wrap">
            {LEGAL.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-body-xs-regular text-text-tertiary opacity-70"
              >
                {l.label}
              </a>
            ))}
            <span className="text-body-xs-regular text-text-tertiary opacity-50">
              © Nara Space Technology Inc.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
