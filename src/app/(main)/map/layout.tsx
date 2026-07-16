import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '위성 영상 구매 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
