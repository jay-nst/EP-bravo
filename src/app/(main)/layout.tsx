import Header from '@/components/layout/Header';

export const dynamic = 'force-dynamic';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
    </>
  );
}
