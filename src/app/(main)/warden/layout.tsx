import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Warden - 산림 모니터링 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
