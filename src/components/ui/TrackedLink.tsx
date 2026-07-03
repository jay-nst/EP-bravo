'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { trackEvent } from '@/lib/analytics';

interface TrackedLinkProps extends ComponentProps<typeof Link> {
  eventName: string;
  eventProperties?: Record<string, unknown>;
}

export default function TrackedLink({
  eventName,
  eventProperties = {},
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackEvent('cta_click', eventName, eventProperties);
        onClick?.(e);
      }}
    />
  );
}
