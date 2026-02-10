'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { LenisProvider } from '@/components/LenisProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LenisProvider>{children}</LenisProvider>
    </ThemeProvider>
  );
}
