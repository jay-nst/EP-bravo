import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Warden · 기후 컴플라이언스 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
