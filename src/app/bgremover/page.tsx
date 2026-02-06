'use client';

import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Header, ImageViewer, ProcessingControls, SettingsPanel, Toolbar, UploadArea } from './_components';
import { BGRemoverProvider, useBGRemover } from './_components/BGRemoverContext';

function BGRemoverContent() {
  const { selectedImage } = useBGRemover();

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-[#0a0a0a] text-white selection:bg-fuchsia-500/30'>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');

        .font-display {
          font-family: 'Syne', sans-serif;
        }

        .font-mono-industrial {
          font-family: 'Space Grotesk', monospace;
        }

        .noise-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .grid-pattern {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .glow-line {
          box-shadow:
            0 0 20px rgba(236, 72, 153, 0.5),
            0 0 40px rgba(236, 72, 153, 0.2);
        }

        .brutal-shadow {
          box-shadow: 6px 6px 0 rgba(236, 72, 153, 0.8);
        }

        .brutal-shadow-sm {
          box-shadow: 3px 3px 0 rgba(236, 72, 153, 0.6);
        }

        @keyframes glitch {
          0%,
          100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
        }

        .glitch-text:hover {
          animation: glitch 0.3s ease infinite;
        }

        .checkerboard {
          background-image:
            linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%);
          background-size: 16px 16px;
          background-position:
            0 0,
            0 8px,
            8px -8px,
            -8px 0px;
          background-color: #0f0f0f;
        }
      `}</style>

      <div className='noise-overlay' />

      <Header />

      <main className='grid-pattern flex-1 overflow-hidden px-4 py-4 lg:px-6'>
        <AnimatePresence mode='wait'>
          {!selectedImage ?
            <UploadArea />
          : <motion.div
              key='processing'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='flex h-full flex-col'
            >
              <Toolbar />

              <div className='grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr,240px]'>
                <div className='flex min-h-0 flex-col gap-3'>
                  <ImageViewer />
                  <ProcessingControls />
                </div>
                <SettingsPanel />
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </main>
    </div>
  );
}

function BGRemoverPage() {
  return (
    <BGRemoverProvider>
      <BGRemoverContent />
    </BGRemoverProvider>
  );
}

export default dynamic(() => Promise.resolve(BGRemoverPage), { ssr: false });
