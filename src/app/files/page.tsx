import FileUploader from '@/app/files/_components/FileUploader';
import PageBack from '@/components/PageBack';
import Constants from '@/lib/constants';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: `${Constants.NAME} | ${Constants.FileUploader.title}`,
  description: Constants.FileUploader.description,
};

export default function Page(): React.JSX.Element {
  return (
    <>
      <PageBack />
      <div className='flex min-h-screen flex-col overflow-hidden bg-[#0a0a0a] text-white selection:bg-fuchsia-500/30'>
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
            0%, 100% {
              transform: translate(0);
              text-shadow: 
                0.05em 0 0 currentColor,
                0.05em 0 0 currentColor,
                0.05em 0.05em currentColor,
                0.05em -0.05em currentColor;
            }
            }
            10% {
              transform: translate(-2px, 2px);
              text-shadow: 
                -0.05em 0 0 #f472b6,
                0.05em 0 0 #f472b6,
                0.05em 0.05em #f472b6;
            }
            }
            20% {
              transform: translate(-2px, -2px);
              text-shadow: 
                0.05em 0 0 currentColor,
                0.05em 0 0 #00ffff,
                -0.05em 0 0 #00ffff,
                0.05em 0.05em #00ffff;
            }
            }
            30% {
              opacity: 0.8;
            }
            40% {
              transform: translate(2px, -2px);
              text-shadow: 
                0.05em 0 0 #f472b6,
                0.05em 0 0 #f472b6,
                0.05em 0.05em #f472b6;
            }
            }
            50% {
              opacity: 0.8;
              text-shadow: 
                0 0 5px #f472b6,
                0 0 5px #f472b6,
                0 0 5px #f472b6;
            }
            }
            60% {
              transform: translate(-2px, 2px);
              text-shadow: 
                -0.05em 0 0 #ff0080,
                0.05em 0 0 #ff0080,
                0.05em 0 0 #ff0080;
            }
            }
            70% {
              opacity: 0.8;
            }
            80% {
              transform: translate(2px, 2px);
              text-shadow: 
                0 0 5px #00ffff,
                0 0 5px #00ffff,
                0 0 5px #00ffff;
            }
            }
            90% {
              opacity: 0.8;
            }
          }

          .glitch-text:hover {
            animation: glitch 0.3s infinite;
          }
        `}</style>

        <div className='noise-overlay' />

        <main className='grid-pattern flex-1 overflow-hidden px-4 py-4 lg:px-6'>
          <div className='flex h-full items-center justify-center'>
            <FileUploader />
          </div>
        </main>
      </div>
    </>
  );
}
