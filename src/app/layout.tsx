import type { Metadata, Viewport } from 'next';
import './globals.css';
import ThemeProvider from '@/components/theme/ThemeProvider';

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
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0E0E10' },
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 테마 클래스(.dark)·color-scheme 은 next-themes 가 마운트 전 스크립트로 붙인다
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
