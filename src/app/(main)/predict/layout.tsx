import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Predict - 자산 검증 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
