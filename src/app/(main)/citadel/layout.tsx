import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Citadel - 재난 관제 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
