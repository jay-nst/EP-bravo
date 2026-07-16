import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '위성 퀴즈 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
