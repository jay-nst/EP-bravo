import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Warden · 기후 인텔리전스 | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
