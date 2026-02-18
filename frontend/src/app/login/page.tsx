'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const LoginPage = dynamic(() => import('@/views/login').then((m) => m.LoginPage), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function LoginRoute() {
  const router = useRouter();

  return (
    <LoginPage
      onLoginSuccess={() => {
        router.push('/dashboard');
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }}
    />
  );
}
