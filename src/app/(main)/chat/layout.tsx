import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EP Agent | EarthPaper',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
