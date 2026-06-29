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
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
