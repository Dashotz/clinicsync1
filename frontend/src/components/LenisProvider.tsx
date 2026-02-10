'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

type LenisContextValue = {
  lenis: Lenis | null;
};

const LenisContext = createContext<LenisContextValue>({ lenis: null });

export function useLenis(): Lenis | undefined {
  const { lenis } = useContext(LenisContext);
  return lenis ?? undefined;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    document.documentElement.classList.add('lenis');
    const instance = new Lenis({
      lerp: 0.15,
      duration: 0.8,
      smoothWheel: true,
      anchors: true,
      autoRaf: false,
      overscroll: false,
    });

    requestAnimationFrame(() => setLenis(instance));

    function raf(time: number) {
      instance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafRef.current);
      instance.destroy();
      document.documentElement.classList.remove('lenis');
      setLenis(null);
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis }}>
      {children}
    </LenisContext.Provider>
  );
}
