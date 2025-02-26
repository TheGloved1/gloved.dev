'use client';
import { motion } from 'framer-motion';
import { Link } from 'next-view-transitions';

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center h-screen w-screen p-12 bg-gray-900'>
      <motion.div
        className='flex flex-col items-center justify-center bg-gray-800 shadow-md rounded-lg p-12'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className='text-6xl font-bold mb-4 flex flex-row'
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
        <motion.p className='text-2xl mb-8' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          Page not found. Why are you here?
        </motion.p>
        <Link href='/'>
          <motion.button
            drag
            className='px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-md'
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
