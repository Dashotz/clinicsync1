import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ProductShowcase from '@/components/ProductShowcase';
import Benefits from '@/components/Benefits';
import Pricing from '@/components/Pricing';
import Comparison from '@/components/Comparison';
import Testimonials from '@/components/Testimonials';
import DemoRequest from '@/components/DemoRequest';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

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
        <ProductShowcase />
        <Benefits />
        <Pricing />
        <Comparison />
        <Testimonials />
        <DemoRequest />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default App;
