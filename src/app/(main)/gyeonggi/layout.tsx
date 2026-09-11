import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '경기 공원 접근성 지도 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
