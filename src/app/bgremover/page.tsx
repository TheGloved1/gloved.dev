/* eslint-disable @next/next/no-img-element */
'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { removeBackground } from '@imgly/background-removal';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './_components/Header';
import { ImageViewer } from './_components/ImageViewer';
import { ProcessingControls } from './_components/ProcessingControls';
import { SettingsPanel } from './_components/SettingsPanel';
import { Toolbar } from './_components/Toolbar';
import { UploadArea } from './_components/UploadArea';
import type { Device, Model, OutputFormat, ProgressState } from './_components/types';

function BGRemoverComponent() {
  const [selectedImage, setSelectedImage] = useLocalStorage<string | null>('bgremover-selected-image', null);
  const [processedImage, setProcessedImage] = useLocalStorage<string | null>('bgremover-processed-image', null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [device, setDevice] = useState<Device>('gpu');
  const [model, setModel] = useState<Model>('isnet');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png');
  const [quality, setQuality] = useState(0.8);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imglyPath = useMemo(() => {
    return typeof window !== 'undefined' ? window.location.origin + '/imgly/' : undefined;
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target?.result as string);
          setProcessedImage(null);
        };
        reader.readAsDataURL(file);
      }
    },
    [setSelectedImage, setProcessedImage],
  );

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

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect],
  );

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

  useEffect(() => {
    const handlePasteGlobal = (e: ClipboardEvent) => handlePaste(e);
    document.addEventListener('paste', handlePasteGlobal);
    return () => {
      document.removeEventListener('paste', handlePasteGlobal);
    };
  }, [handlePaste]);

  const removeBackgroundFromImage = useCallback(async () => {
    if (!selectedImage) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setProcessedImage(null);
    setProgress(null);
    setIsProcessing(true);
    setProgress({ progress: 0, stage: 'INITIALIZING' });

    try {
      const response = await fetch(selectedImage, { signal: abortController.signal });
      const blob = await response.blob();

      if (abortController.signal.aborted) {
        return;
      }

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
          if (abortController.signal.aborted) {
            return;
          }

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

      if (abortController.signal.aborted) {
        return;
      }

      setProgress({ progress: 35, stage: 'CONVERTING' });

      const processedDataUrl = await new Promise<string>((resolve, reject) => {
        setProgress({ progress: 50, stage: 'CONVERTING' });
        if (abortController.signal.aborted) {
          reject(new DOMException('Processing was cancelled', 'AbortError'));
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          if (!abortController.signal.aborted) {
            resolve(reader.result as string);
            setProgress({ progress: 75, stage: 'CONVERTING' });
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(resultBlob);
      });

      if (abortController.signal.aborted) {
        return;
      }

      setProcessedImage(processedDataUrl);
      setProgress({ progress: 100, stage: 'COMPLETE' });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('BGRemover: Processing cancelled');
        return;
      }

      if (error instanceof Error && error.message.includes('Session already started')) {
        console.log('BGRemover: Session conflict, retrying...');
        setTimeout(() => {
          if (!abortController.signal.aborted) {
            removeBackgroundFromImage();
          }
        }, 500);
        return;
      }

      console.error('BGRemover: Error during processing', error);
      setProgress({ progress: 0, stage: 'ERROR' });
    } finally {
      if (abortControllerRef.current === abortController) {
        setIsProcessing(false);
        setTimeout(() => {
          if (abortControllerRef.current === abortController) {
            setProgress(null);
          }
        }, 4000);
      }
    }
  }, [selectedImage, device, model, imglyPath, outputFormat, quality, setProcessedImage]);

  const copyImageToClipboard = useCallback(async () => {
    if (!processedImage) return;

    try {
      const response = await fetch(processedImage);
      const blob = await response.blob();

      const clipboardItem = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([clipboardItem]);

      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 1000);
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
    }
  }, [processedImage]);

  const downloadImage = useCallback(() => {
    if (processedImage) {
      const link = document.createElement('a');
      const extension = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat.split('/')[1];
      link.download = `extracted_${new Date().toISOString()}.${extension}`;
      link.href = processedImage;
      link.click();
      document.body.removeChild(link);
    }
  }, [processedImage, outputFormat]);

  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);
    setProgress(null);
  }, []);

  const resetAll = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setSelectedImage(null);
    setProcessedImage(null);
    setProgress(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setSelectedImage, setProcessedImage]);

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
            <UploadArea
              fileInputRef={fileInputRef}
              dragActive={dragActive}
              onFileInput={handleFileInput}
              onDrag={handleDrag}
              onDrop={handleDrop}
            />
          : <motion.div
              key='processing'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='flex h-full flex-col'
            >
              <Toolbar
                isProcessing={isProcessing}
                hasProcessedImage={!!processedImage}
                onClear={resetAll}
                onDownload={downloadImage}
              />

              <div className='grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr,240px]'>
                <div className='flex min-h-0 flex-col gap-3'>
                  <ImageViewer
                    selectedImage={selectedImage}
                    processedImage={processedImage}
                    isProcessing={isProcessing}
                    progress={progress}
                    copyFeedback={copyFeedback}
                    onFileInput={handleFileInput}
                    onCopyImage={copyImageToClipboard}
                  />

                  <ProcessingControls
                    isProcessing={isProcessing}
                    hasProcessedImage={!!processedImage}
                    onProcess={removeBackgroundFromImage}
                    onCancel={cancelProcessing}
                  />
                </div>

                <SettingsPanel
                  device={device}
                  model={model}
                  outputFormat={outputFormat}
                  quality={quality}
                  isProcessing={isProcessing}
                  onDeviceChange={setDevice}
                  onModelChange={setModel}
                  onFormatChange={setOutputFormat}
                  onQualityChange={setQuality}
                />
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(BGRemoverComponent), { ssr: false });
