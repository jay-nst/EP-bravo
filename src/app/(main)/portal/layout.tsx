import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '내 주문 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
