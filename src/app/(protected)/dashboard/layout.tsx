import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Dashboard | AIrCrawl",
  description: "AIrCrawl Dashboard Overview",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout bg-white">
      {children}
    </div>
  );
}