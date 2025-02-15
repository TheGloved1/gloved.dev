'use client'

import { motion as m } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <m.div
      translate='yes'
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: 'easeInOut', duration: 0.75 }}
      className='flex relative z-10 min-h-screen flex-col items-center from-sky-950 to-[#1e210c] text-white'
    >
      {children}
    </m.div>
  )
}
