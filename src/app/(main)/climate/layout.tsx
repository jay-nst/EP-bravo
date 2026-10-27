import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '메탄 정보 포털 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
