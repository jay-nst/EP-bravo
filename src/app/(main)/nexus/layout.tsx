import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nexus - AI 분석 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
