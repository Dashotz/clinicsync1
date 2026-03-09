import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col">
        <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
