'use client';

import Link from 'next/link';

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

const sectionHeader: React.CSSProperties = {
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 12,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  display: 'block',
  marginBottom: 14,
};

const listStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const linkStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-muted)',
  textDecoration: 'none',
};

const externalIcon = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
    <path d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
);

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }} className="px-4 py-8 md:px-6 md:py-12">
        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 32,
            marginBottom: 48,
          }}
        >
          {/* Platforms */}
          <div>
            <span style={sectionHeader}>플랫폼</span>
            <ul style={listStyle}>
              {PLATFORMS.map((p) => (
                <li key={p.label}>
                  <Link
                    href={p.href}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{p.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <span style={sectionHeader}>서비스</span>
            <ul style={listStyle}>
              {SERVICES.map((s) => (
                <li key={s.label}>
                  <Link href={s.href} style={linkStyle}>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <span style={sectionHeader}>고객지원</span>
            <ul style={listStyle}>
              {SUPPORT.map((r) => (
                <li key={r.label}>
                  {r.external ? (
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...linkStyle, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      {r.label}
                      {externalIcon}
                    </a>
                  ) : (
                    <Link href={r.href} style={linkStyle}>
                      {r.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <span style={sectionHeader}>소셜</span>
            <ul style={listStyle}>
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...linkStyle, display: 'inline-flex', alignItems: 'center', gap: 4 }}
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
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="6" stroke="var(--text-muted)" strokeWidth="1.5" />
              <ellipse cx="12" cy="12" rx="10" ry="4" stroke="var(--accent)" strokeWidth="1" transform="rotate(-30 12 12)" opacity="0.4" />
            </svg>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
              EARTHPAPER
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {LEGAL.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  opacity: 0.7,
                }}
              >
                {l.label}
              </a>
            ))}
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--text-muted)', opacity: 0.5 }}>
              © Nara Space Technology Inc.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
