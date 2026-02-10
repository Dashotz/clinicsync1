import type { Metadata } from 'next';
import '@/app/globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'ClinicSync | Dental Practice Management',
  description: 'Dental Practice Management',
  icons: {
    icon: [
      { url: '/brand/logo-lgt.svg', media: '(prefers-color-scheme: light)' },
      { url: '/brand/logo-drk.svg', media: '(prefers-color-scheme: dark)' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
