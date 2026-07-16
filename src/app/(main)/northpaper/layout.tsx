import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Northpaper - 변화 탐지 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
