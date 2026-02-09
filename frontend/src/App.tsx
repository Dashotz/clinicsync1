import React, { Suspense, lazy } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/App.css';

// Lazy load below-the-fold components to reduce initial bundle size
const ProductShowcase = lazy(() => import('@/components/ProductShowcase'));
const Benefits = lazy(() => import('@/components/Benefits'));
const Pricing = lazy(() => import('@/components/Pricing'));
const Comparison = lazy(() => import('@/components/Comparison'));
const Testimonials = lazy(() => import('@/components/Testimonials'));
const DemoRequest = lazy(() => import('@/components/DemoRequest'));
const Footer = lazy(() => import('@/components/Footer'));

// Loading fallback component
const SectionLoader = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  React.useEffect(() => {
    document.title = 'ClinicSync | AI-Powered Dental Practice Management';
  }, []);

  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <Features />
        <Suspense fallback={<SectionLoader />}>
          <ProductShowcase />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Benefits />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Pricing />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Comparison />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <DemoRequest />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <Toaster />
    </div>
  );
};

export default App;
