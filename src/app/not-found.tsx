'use client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center bg-background p-12'>
      <motion.div
        className='flex flex-col items-center justify-center rounded-lg bg-gray-800 p-12 shadow-md'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className='mb-4 flex flex-row text-6xl font-bold'
          initial={{ y: -100 }}
          animate={{
            y: [0, -10, 0],
            transition: {
              duration: 1.5,
              timeConstant: 200,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'loop',
            },
          }}
          transition={{ duration: 0.5 }}
        >
          <div className='text-red-700'>404</div>
        </motion.h1>
        <motion.p className='mb-8 text-2xl' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          Page not found. Why are you here?
        </motion.p>
        <Link href='/'>
          <Button variant={'secondary'} className='rounded-md px-8 py-6 font-bold text-white hover:bg-gray-600'>
            Go home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
