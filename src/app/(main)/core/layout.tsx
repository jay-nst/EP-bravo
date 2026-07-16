import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Core - 위성 지도 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
