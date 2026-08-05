import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '서울 기후 대시보드 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
