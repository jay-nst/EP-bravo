import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EarthPaper - 위성 영상 셀프서비스 포털',
  description:
    'Observer, SpaceEye-T 위성 영상을 AOI 기반으로 검색, 클리핑, 즉시 다운로드',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0E0E10',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full dark" style={{ colorScheme: 'dark' }}>
      <body suppressHydrationWarning>
        {/* NDS 포털(Dialog·Select·Tooltip)이 항상 앱 위에 뜨도록 독립 스태킹 컨텍스트.
            body 가 세로 flex 이므로 래퍼도 같은 flex 를 이어받는다 */}
        <div className="isolate flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}
