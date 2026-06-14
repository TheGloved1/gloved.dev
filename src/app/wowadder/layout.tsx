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

export default function WowAdderLayout({ children }: { children: React.ReactNode }) {
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
      <div className='font-wow-body relative min-h-screen bg-[#0c0a09] text-[#faf6f0] selection:bg-[#a16207]/30'>
        <div className='wow-scanline pointer-events-none fixed inset-0' />

        <PageBack
          stayTop
          className='z-50'
          btnClassName='border border-[#3f3a36] bg-[#1c1917] text-xs text-[#a8a29e] transition-all duration-150 hover:border-[#a16207] hover:text-[#faf6f0] hover:shadow-[0_0_8px_rgba(161,98,7,0.2)]'
        />

        <motion.div animate={controls} initial={{ x: 0, opacity: 1 }}>
          {children}
        </motion.div>
      </div>
    </TransitionContext.Provider>
  );
}
