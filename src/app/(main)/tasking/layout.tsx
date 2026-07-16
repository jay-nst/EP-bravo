import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '촬영 요청 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
