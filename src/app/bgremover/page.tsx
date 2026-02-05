/* eslint-disable @next/next/no-img-element */
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { removeBackground } from '@imgly/background-removal';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Cpu, Download, X, Zap } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useRef, useState } from 'react';

export default function BGRemover() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ progress: number; stage: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [device, setDevice] = useState<'cpu' | 'gpu'>('gpu');
  const [model, setModel] = useState<'isnet' | 'isnet_fp16' | 'isnet_quint8'>('isnet');
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState(0.8);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imglyPath = typeof window !== 'undefined' ? window.location.origin + '/imgly/' : undefined;

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            handleFileSelect(file);
            e.preventDefault();
            break;
          }
        }
      }
    },
    [handleFileSelect],
  );

  React.useEffect(() => {
    const handlePasteGlobal = (e: ClipboardEvent) => handlePaste(e);
    document.addEventListener('paste', handlePasteGlobal);
    return () => {
      document.removeEventListener('paste', handlePasteGlobal);
    };
  }, [handlePaste]);

  const removeBackgroundFromImage = async () => {
    if (!selectedImage) return;

    setProcessedImage(null);
    setProgress(null);
    setIsProcessing(true);
    setProgress({ progress: 0, stage: 'INITIALIZING' });

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      setProgress({ progress: 25, stage: 'LOADING MODEL' });

      const resultBlob = await removeBackground(blob, {
        device: device,
        model,
        publicPath: imglyPath,
        output: {
          format: outputFormat,
          quality: quality,
        },
        progress: (key, current) => {
          let displayProgress = 0;
          if (current > 1 && current <= 4) {
            displayProgress = Math.round((current / 4) * 100);
          } else if (current > 1) {
            displayProgress = Math.min(99, Math.round(current / 100000000));
          } else {
            displayProgress = Math.round(current * 100);
          }
          setProgress({ progress: displayProgress, stage: key.toUpperCase().replace(/_/g, ' ') });
        },
      });

      setProgress({ progress: 75, stage: 'CONVERTING' });

      const processedDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(resultBlob);
      });

      setProcessedImage(processedDataUrl);
      setProgress({ progress: 100, stage: 'COMPLETE' });
    } catch (error) {
      console.error('BGRemover: Error during processing', error);
      setProgress({ progress: 0, stage: 'ERROR' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress(null);
      }, 2000);
    }
  };

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      const extension = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat.split('/')[1];
      link.download = `extracted.${extension}`;
      link.href = processedImage;
      link.click();
    }
  };

  const resetAll = () => {
    setSelectedImage(null);
    setProcessedImage(null);
    setProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-[#0a0a0a] text-white selection:bg-fuchsia-500/30'>
      <style jsx global>{`
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

      {/* Compact Header */}
      <header className='flex-shrink-0 border-b border-white/10 px-4 py-3 lg:px-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='glow-line h-2 w-2 bg-fuchsia-500' />
            <h1 className='font-display text-xl font-bold uppercase tracking-tight lg:text-2xl'>
              <span className='glitch-text'>BG</span>
              <span className='text-fuchsia-500'>_</span>
              <span className='glitch-text'>REMOVER</span>
            </h1>
            <Link href='/'>
              <span className='font-mono-industrial hidden text-[10px] tracking-[0.2em] text-white/30 hover:text-white lg:inline'>
                GLOVED.DEV
              </span>
            </Link>
          </div>
          <div className='flex items-center gap-4'>
            <div className='font-mono-industrial hidden text-[10px] text-white/30 lg:flex lg:items-center lg:gap-4'>
              <span>LOCAL PROCESSING</span>
              <span>•</span>
              <span>ZERO UPLOAD</span>
            </div>
            <div className='flex h-8 w-8 items-center justify-center border border-fuchsia-500/50 bg-fuchsia-500/10'>
              <div className='h-1.5 w-1.5 animate-pulse bg-fuchsia-500' />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Fills remaining space */}
      <main className='grid-pattern flex-1 overflow-hidden px-4 py-4 lg:px-6'>
        <AnimatePresence mode='wait'>
          {!selectedImage ?
            /* Upload State */
            <motion.div
              key='upload'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className='flex h-full items-center justify-center'
            >
              <div
                className={cn(
                  'group relative h-full w-full max-w-4xl border-2 border-dashed transition-all duration-300',
                  dragActive ? 'border-fuchsia-500 bg-fuchsia-500/5' : 'border-white/20 hover:border-white/40',
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleFileInput}
                  className='absolute inset-0 z-10 cursor-pointer opacity-0'
                  id='file-upload'
                />

                {/* Corner decorations */}
                <div className='absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-fuchsia-500' />
                <div className='absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-fuchsia-500' />
                <div className='absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-fuchsia-500' />
                <div className='absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-fuchsia-500' />

                <div className='flex h-full flex-col items-center justify-center p-8'>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className='mb-6 flex h-20 w-20 items-center justify-center border border-white/10 bg-white/5'
                  >
                    <svg className='h-10 w-10 text-white/30' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='square'
                        strokeWidth={1}
                        d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className='text-center'
                  >
                    <h2 className='font-display text-2xl font-bold uppercase tracking-tight lg:text-3xl'>DROP YOUR IMAGE</h2>
                    <p className='font-mono-industrial mt-3 text-xs text-white/50'>CLICK ANYWHERE • PASTE WITH CTRL+V</p>
                    <div className='font-mono-industrial mt-6 flex flex-wrap items-center justify-center gap-3 text-[10px] text-white/30'>
                      <span className='border border-white/10 px-2 py-1'>JPG</span>
                      <span className='border border-white/10 px-2 py-1'>PNG</span>
                      <span className='border border-white/10 px-2 py-1'>WEBP</span>
                    </div>
                  </motion.div>
                </div>

                {dragActive && (
                  <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: '100%' }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className='absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent'
                  />
                )}
              </div>
            </motion.div>
          : /* Processing State */
            <motion.div
              key='processing'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='flex h-full flex-col'
            >
              {/* Toolbar */}
              <div className='mb-3 flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3'>
                <div className='flex items-center gap-3'>
                  <Button
                    variant='ghost'
                    onClick={resetAll}
                    className='font-mono-industrial h-8 border border-white/10 px-3 text-[10px] uppercase tracking-wider hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400'
                  >
                    <X className='mr-1.5 h-3 w-3' />
                    CLEAR
                  </Button>

                  {processedImage && (
                    <Button
                      onClick={downloadImage}
                      className='brutal-shadow-sm font-mono-industrial h-8 border-2 border-fuchsia-500 bg-fuchsia-500 px-4 text-[10px] uppercase tracking-wider text-black transition-all hover:bg-fuchsia-400'
                    >
                      <Download className='mr-1.5 h-3 w-3' />
                      DOWNLOAD
                    </Button>
                  )}
                </div>

                <div className='font-mono-industrial text-[10px] text-white/40'>
                  {isProcessing ?
                    <span className='flex items-center gap-2'>
                      <span className='h-1.5 w-1.5 animate-pulse bg-fuchsia-500' />
                      PROCESSING
                    </span>
                  : processedImage ?
                    <span className='text-green-400'>✓ COMPLETE</span>
                  : 'READY'}
                </div>
              </div>

              {/* Content area */}
              <div className='grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr,240px]'>
                {/* Image area - side by side */}
                <div className='flex min-h-0 flex-col gap-3'>
                  <div className='grid min-h-0 flex-1 grid-cols-2 gap-3'>
                    {/* Original image - clickable to replace */}
                    <label
                      htmlFor='file-upload-replace'
                      className='group relative min-h-0 cursor-pointer overflow-hidden border border-white/10 bg-black transition-all hover:border-white/30'
                    >
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handleFileInput}
                        className='hidden'
                        id='file-upload-replace'
                      />
                      <img src={selectedImage} alt='Original' className='h-full w-full object-contain' />
                      <div className='absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100'>
                        <div className='text-center'>
                          <svg
                            className='mx-auto h-6 w-6 text-white/80'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={1.5}
                              d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
                            />
                          </svg>
                          <p className='font-mono-industrial mt-1 text-[10px] text-white/80'>REPLACE</p>
                        </div>
                      </div>
                      <div className='font-mono-industrial absolute bottom-2 left-2 z-10 border border-white/20 bg-black/80 px-2 py-0.5 text-[10px] uppercase'>
                        ORIGINAL
                      </div>
                    </label>

                    {/* Processed image */}
                    <div className='relative min-h-0 overflow-hidden border border-white/10 bg-black'>
                      <div className='checkerboard absolute inset-0' />

                      {processedImage ?
                        <img src={processedImage} alt='Processed' className='relative h-full w-full object-contain' />
                      : isProcessing ?
                        <div className='absolute inset-0 flex flex-col items-center justify-center'>
                          <div className='relative mb-4 h-16 w-16 border border-fuchsia-500/30'>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                              className='absolute inset-1 border-2 border-transparent border-t-fuchsia-500'
                            />
                            <motion.div
                              animate={{ rotate: -360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                              className='absolute inset-3 border-2 border-transparent border-b-fuchsia-500/50'
                            />
                          </div>
                          {progress && (
                            <div className='w-32 space-y-2'>
                              <div className='h-1 overflow-hidden bg-white/10'>
                                <motion.div
                                  className='h-full bg-fuchsia-500'
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress.progress}%` }}
                                />
                              </div>
                              <div className='font-mono-industrial text-center text-[10px]'>
                                <span className='text-white/50'>{progress.stage}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      : <div className='absolute inset-0 flex items-center justify-center'>
                          <p className='font-mono-industrial text-[10px] text-white/30'>RESULT</p>
                        </div>
                      }

                      {processedImage && (
                        <div className='font-mono-industrial absolute bottom-2 left-2 z-10 border border-fuchsia-500/50 bg-black/80 px-2 py-0.5 text-[10px] uppercase text-fuchsia-400'>
                          EXTRACTED
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  {!processedImage && !isProcessing && (
                    <Button
                      onClick={removeBackgroundFromImage}
                      disabled={isProcessing}
                      className='brutal-shadow font-display h-10 w-full flex-shrink-0 border-2 border-fuchsia-500 bg-fuchsia-500 text-sm font-bold uppercase tracking-wider text-black transition-all hover:bg-fuchsia-400 disabled:opacity-50'
                    >
                      <span>EXTRACT SUBJECT</span>
                      <ArrowRight className='ml-2 h-4 w-4' />
                    </Button>
                  )}

                  {processedImage && (
                    <Button
                      onClick={removeBackgroundFromImage}
                      disabled={isProcessing}
                      variant='outline'
                      className='font-mono-industrial h-8 w-full flex-shrink-0 border-white/20 text-[10px] uppercase tracking-wider hover:border-white/40 hover:bg-white/5'
                    >
                      REPROCESS
                    </Button>
                  )}
                </div>

                {/* Settings panel */}
                <div className='flex flex-col gap-3 overflow-y-auto'>
                  <div className='border border-white/10 bg-white/[0.02] p-4'>
                    <h3 className='font-display mb-4 text-[10px] font-bold uppercase tracking-wider text-white/50'>
                      CONFIG
                    </h3>

                    <div className='space-y-4'>
                      {/* Device */}
                      <div className='space-y-1.5'>
                        <label className='font-mono-industrial text-[10px] text-white/40'>PROCESSING</label>
                        <div className='grid grid-cols-2 gap-1.5'>
                          <button
                            onClick={() => setDevice('cpu')}
                            disabled={isProcessing}
                            className={cn(
                              'font-mono-industrial flex items-center justify-center gap-1.5 border p-2 text-[10px] uppercase transition-all disabled:opacity-50',
                              device === 'cpu' ?
                                'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400'
                              : 'border-white/10 text-white/50 hover:border-white/30',
                            )}
                          >
                            <Cpu className='h-3 w-3' />
                            CPU
                          </button>
                          <button
                            onClick={() => setDevice('gpu')}
                            disabled={isProcessing}
                            className={cn(
                              'font-mono-industrial flex items-center justify-center gap-1.5 border p-2 text-[10px] uppercase transition-all disabled:opacity-50',
                              device === 'gpu' ?
                                'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400'
                              : 'border-white/10 text-white/50 hover:border-white/30',
                            )}
                          >
                            <Zap className='h-3 w-3' />
                            GPU
                          </button>
                        </div>
                      </div>

                      {/* Output Format */}
                      <div className='space-y-1.5'>
                        <label className='font-mono-industrial text-[10px] text-white/40'>FORMAT</label>
                        <div className='grid grid-cols-3 gap-1.5'>
                          {(['image/png', 'image/jpeg', 'image/webp'] as const).map((format) => (
                            <button
                              key={format}
                              onClick={() => setOutputFormat(format)}
                              disabled={isProcessing}
                              className={cn(
                                'font-mono-industrial border p-1.5 text-[10px] uppercase transition-all disabled:opacity-50',
                                outputFormat === format ?
                                  'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400'
                                : 'border-white/10 text-white/50 hover:border-white/30',
                              )}
                            >
                              {format.split('/')[1]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Model */}
                      <div className='space-y-1.5'>
                        <label className='font-mono-industrial text-[10px] text-white/40'>MODEL</label>
                        <div className='space-y-1.5'>
                          {(['isnet', 'isnet_fp16', 'isnet_quint8'] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setModel(m)}
                              disabled={isProcessing}
                              className={cn(
                                'font-mono-industrial w-full border p-1.5 text-left text-[10px] uppercase transition-all disabled:opacity-50',
                                model === m ?
                                  'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400'
                                : 'border-white/10 text-white/50 hover:border-white/30',
                              )}
                            >
                              {m === 'isnet' ?
                                'DEFAULT'
                              : m === 'isnet_fp16' ?
                                'FP16'
                              : 'QUINT8'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quality */}
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <label className='font-mono-industrial text-[10px] text-white/40'>QUALITY</label>
                          <span className='font-mono-industrial text-[10px] text-fuchsia-400'>
                            {Math.round(quality * 100)}%
                          </span>
                        </div>
                        <input
                          type='range'
                          min='0.1'
                          max='1'
                          step='0.1'
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                          disabled={isProcessing}
                          className='h-1 w-full cursor-pointer appearance-none bg-white/10 accent-fuchsia-500 disabled:opacity-50'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Info panel */}
                  <div className='border border-white/10 bg-white/[0.02] p-4'>
                    <h3 className='font-display mb-3 text-[10px] font-bold uppercase tracking-wider text-white/50'>INFO</h3>
                    <div className='font-mono-industrial space-y-2 text-[10px] text-white/40'>
                      <div className='flex justify-between'>
                        <span>PROCESSING</span>
                        <span className='text-white/60'>LOCAL</span>
                      </div>
                      <div className='flex justify-between'>
                        <span>PRIVACY</span>
                        <span className='text-green-400'>SECURE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </main>
    </div>
  );
}
