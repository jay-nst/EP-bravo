import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '탐색 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
