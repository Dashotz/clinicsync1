import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/app/globals.css';
import { Providers } from '@/components/providers';

const geistSans = Geist({ subsets: ['latin'] });
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'ClinicSync | Dental Practice Management',
  description: 'Dental Practice Management',
  icons: {
    icon: [
      { url: '/brand/logo-lgt.svg', media: '(prefers-color-scheme: light)' },
      { url: '/brand/logo-drk.svg', media: '(prefers-color-scheme: dark)' },
      { url: '/brand/logo-lgt.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/brand/logo-lgt.svg',
    apple: '/brand/logo-lgt.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
