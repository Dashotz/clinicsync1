import { BarChart3 } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="h-full flex flex-col overflow-auto p-4 sm:p-6 lg:p-8 bg-background">
      <header className="flex flex-col gap-0.5 sm:gap-1 mb-6 sm:mb-8 flex-shrink-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Insights</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">Analytics and performance reports for your clinic</p>
      </header>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Coming soon</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Clinic insights and analytics are currently under development. Check back soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
