'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import type { MapStyleId } from './EarthMap';
import { mapStyleForTheme, toResolvedTheme, type ResolvedTheme } from '@/lib/theme';
import { useMounted } from '@/components/theme/useMounted';

/**
 * 지도 스타일 상태. 다크/라이트 베이스맵은 사이트 테마를 따라가고,
 * 사용자가 고른 스타일은 그 테마가 유지되는 동안 그대로 둔다(위성·야간은 테마가 바뀌어도 유지).
 */
export function useThemedMapStyle(initial: MapStyleId = 'dark') {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const theme: ResolvedTheme = mounted ? toResolvedTheme(resolvedTheme) : 'dark';

  // theme: 사용자가 고를 때의 테마. null = 아직 고르지 않음(항상 테마를 따름)
  const [choice, setChoice] = useState<{ id: MapStyleId; theme: ResolvedTheme | null }>({
    id: initial,
    theme: null,
  });

  const mapStyleId = choice.theme === theme ? choice.id : mapStyleForTheme(choice.id, theme);
  const setMapStyleId = (id: MapStyleId) => setChoice({ id, theme });

  return [mapStyleId, setMapStyleId] as const;
}
