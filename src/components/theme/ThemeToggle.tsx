'use client';

import { useTheme } from 'next-themes';
import { Button } from '@naraspace-technology/nds/components';
import { IconMoon, IconSun } from '@naraspace-technology/nds/icons';
import { toResolvedTheme } from '@/lib/theme';
import { useMounted } from './useMounted';

/** 헤더 테마 전환 버튼 (NDS text iconOnly — 햄버거 버튼과 같은 모양). 누르면 지금 보이는 테마의 반대로 고정한다. */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isLight = mounted && toResolvedTheme(resolvedTheme) === 'light';
  const label = isLight ? '다크 모드로 전환' : '라이트 모드로 전환';

  return (
    <Button
      variant="text"
      iconOnly
      className="text-text-tertiary! [&_svg]:text-text-tertiary!"
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      aria-label={label}
      title={label}
    >
      {isLight ? <IconMoon /> : <IconSun />}
    </Button>
  );
}
