import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '오늘의 지구 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
