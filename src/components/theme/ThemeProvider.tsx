'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * 라이트/다크 테마. html 에 .dark 클래스를 붙이거나 떼며, 색 정본은
 * src/styles/nds/color.css (:root = 라이트, .dark = 다크). 기본값은 시스템 설정.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="ep-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
