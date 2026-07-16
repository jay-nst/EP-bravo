import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '아티클 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
