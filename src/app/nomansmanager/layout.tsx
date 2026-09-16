'use client';

import PageBack from '@/components/PageBack';
import { motion, useAnimationControls } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect } from 'react';

interface TransitionContextValue {
  navigate: (path: string) => Promise<void>;
}
const TransitionContext = createContext<TransitionContextValue>({
  navigate: async () => {},
});
export const useTransition = () => useContext(TransitionContext);

export default function NoMansManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const controls = useAnimationControls();

  // Reset for enter animation when route changes naturally (browser back/forward)
  useEffect(() => {
    controls.set({ x: '30%', opacity: 0 });
    controls.start({ x: 0, opacity: 1, transition: { duration: 0.1, ease: [0.25, 0.1, 0.25, 1] } });
  }, [pathname, controls]);

  const navigate = useCallback(
    async (path: string) => {
      if (path === pathname) return;
      await controls.start({ x: '-30%', opacity: 0, transition: { duration: 0.1, ease: [0.25, 0.1, 0.25, 1] } });
      router.push(path);
    },
    [pathname, controls, router],
  );

  return (
    <TransitionContext.Provider value={{ navigate }}>
      <div className='font-nms-body relative min-h-screen bg-[#0a0f1a] text-[#e6f1ff] selection:bg-[#0099cc]/30'>
        <div className='nms-scanline pointer-events-none fixed inset-0' />

        <PageBack
          stayTop
          className='z-50'
          btnClassName='border border-[#1e3356] bg-[#111b2d] text-xs text-[#8ea0c0] transition-all duration-150 hover:border-[#0099cc] hover:text-[#e6f1ff] hover:shadow-[0_0_8px_rgba(0,212,255,0.2)]'
        />

        <motion.div animate={controls} initial={{ x: 0, opacity: 1 }}>
          {children}
        </motion.div>
      </div>
    </TransitionContext.Provider>
  );
}
