'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** 서버·하이드레이션 렌더에선 false, 클라이언트 렌더부터 true. 테마별 UI 의 하이드레이션 불일치 방지용. */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
