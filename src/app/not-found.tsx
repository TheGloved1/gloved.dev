'use client';
import { motion } from 'framer-motion';
import { Link } from 'next-view-transitions';

export default function NotFound() {
  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center bg-gray-900 p-12'>
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
          404
        </motion.h1>
        <motion.p className='mb-8 text-2xl' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          Page not found. Why are you here?
        </motion.p>
        <Link href='/'>
          <motion.button
            drag
            className='rounded-md bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-600'
            initial={{ scale: 0.75 }}
            whileHover={{ scale: 1 }}
            transition={{
              duration: 0.1,
              ease: 'easeInOut',
              bounce: 0.5,
              bounceDamping: 10,
              min: 0.5,
              stiffness: 100,
              damping: 10,
            }}
          >
            Go home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}
