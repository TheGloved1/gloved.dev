/* eslint-disable @next/next/no-img-element */
'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { removeBackground } from '@imgly/background-removal';
import { Download, Image as ImageIcon, Shield, Sparkles, Upload, Wand2, X, Zap } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

export default function BGRemover() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ progress: number; stage: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [device, setDevice] = useState<'cpu' | 'gpu'>('cpu');
  const [model, setModel] = useState<'isnet' | 'isnet_fp16' | 'isnet_quint8'>('isnet');
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState(0.8);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imglyPath = typeof window !== 'undefined' ? window.location.origin + '/imgly/' : undefined;

  // Debug logging toggle - set to false to disable all console logs
  const DEBUG_MODE = true;

  const handleFileSelect = useCallback(
    (file: File) => {
      if (DEBUG_MODE)
        console.log('BGRemover: File selected', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        });

      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (DEBUG_MODE)
            console.log('BGRemover: File read successfully', {
              resultLength: e.target?.result ? (e.target.result as string).length : 0,
            });
          setSelectedImage(e.target?.result as string);
          setProcessedImage(null);
        };
        reader.onerror = (error) => {
          if (DEBUG_MODE) console.error('BGRemover: Error reading file', error);
        };
        reader.readAsDataURL(file);
      } else {
        if (DEBUG_MODE) console.warn('BGRemover: Invalid file type', file.type);
      }
    },
    [DEBUG_MODE],
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

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeBackgroundFromImage = async () => {
    if (DEBUG_MODE) console.log('BGRemover: Starting background removal');

    if (!selectedImage) {
      if (DEBUG_MODE) console.error('BGRemover: No selected image');
      return;
    }

    // Clear previous result when processing again
    setProcessedImage(null);
    setProgress(null);

    setIsProcessing(true);
    setProgress({ progress: 0, stage: 'Initializing...' });
    const startTime = performance.now();

    try {
      if (DEBUG_MODE) console.log('BGRemover: Converting data URL to blob');

      // Convert data URL to blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      if (DEBUG_MODE)
        console.log('BGRemover: Blob created', {
          size: blob.size,
          type: blob.type,
        });

      setProgress({ progress: 25, stage: 'Loading model...' });

      if (DEBUG_MODE) console.log('BGRemover: Calling removeBackground API');

      // Use the professional background removal library
      const resultBlob = await removeBackground(blob, {
        device: device,
        model,
        publicPath: imglyPath,
        output: {
          format: outputFormat,
          quality: quality,
        },
        progress: (key, current, total) => {
          if (DEBUG_MODE) console.log('BGRemover: Progress update', { key, current, total });

          // Handle different progress formats
          let displayProgress = 0;
          if (current > 1 && current <= 4) {
            // If progress is 0-4 (stage-based), convert to percentage
            displayProgress = Math.round((current / 4) * 100);
          } else if (current > 1) {
            // If progress is > 4, it might be bytes or another format
            displayProgress = Math.min(99, Math.round(current / 100000000)); // Normalize to percentage
          } else {
            // If progress is 0-1, convert to percentage
            displayProgress = Math.round(current * 100);
          }

          setProgress({ progress: displayProgress, stage: key });
        },
      });

      setProgress({ progress: 75, stage: 'Converting to data URL...' });

      if (DEBUG_MODE) console.log('BGRemover: Background removed, converting to data URL');

      // Convert result blob to data URL
      const processedDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(resultBlob);
      });

      const endTime = performance.now();
      const processingTime = (endTime - startTime).toFixed(2);

      if (DEBUG_MODE)
        console.log('BGRemover: Processing completed', {
          processingTime: `${processingTime}ms`,
          outputSize: processedDataUrl.length,
          outputSizeKB: (processedDataUrl.length / 1024).toFixed(2) + 'KB',
        });

      setProcessedImage(processedDataUrl);
      setProgress({ progress: 100, stage: 'Complete' });
    } catch (error) {
      if (DEBUG_MODE) console.error('BGRemover: Error during processing', error);
      setProgress({ progress: 0, stage: 'Error' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress(null);
      }, 2000);
    }
  };

  const downloadImage = () => {
    if (DEBUG_MODE)
      console.log('BGRemover: Downloading processed image', {
        hasProcessedImage: !!processedImage,
        imageSize: processedImage ? processedImage.length : 0,
      });

    if (processedImage) {
      const link = document.createElement('a');
      const extension = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat.split('/')[1];
      link.download = `background-removed.${extension}`;
      link.href = processedImage;
      link.click();
      if (DEBUG_MODE) console.log('BGRemover: Download initiated');
    } else {
      if (DEBUG_MODE) console.warn('BGRemover: No processed image to download');
    }
  };

  const resetAll = () => {
    if (DEBUG_MODE) console.log('BGRemover: Resetting all state');
    setSelectedImage(null);
    setProcessedImage(null);
    setProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <TooltipProvider>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
        <style jsx>{`
          .bg-checkerboard {
            background-color: rgba(255, 255, 255, 0.5);
            background-image:
              linear-gradient(45deg, rgba(229, 231, 235, 0.8) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(229, 231, 235, 0.8) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(229, 231, 235, 0.8) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(229, 231, 235, 0.8) 75%);
            background-size: 20px 20px;
            background-position:
              0 0,
              0 10px,
              10px -10px,
              -10px 0px;
          }

          @keyframes float {
            0%,
            100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }

          .float-animation {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes pulse-glow {
            0%,
            100% {
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
            }
            50% {
              box-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
            }
          }

          .pulse-glow {
            animation: pulse-glow 2s ease-in-out infinite;
          }
        `}</style>

        <div className='container mx-auto max-w-6xl p-6'>
          {/* Header */}
          <div className='mb-8 text-center'>
            <div className='mb-4 inline-flex items-center justify-center rounded-full bg-blue-100 p-3 dark:bg-blue-900'>
              <Sparkles className='h-8 w-8 text-blue-600 dark:text-blue-400' />
            </div>
            <h1 className='mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent dark:from-blue-400 dark:to-purple-400'>
              Background Remover
            </h1>
            <p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
              Remove backgrounds from your images instantly with advanced algorithms. All processing happens securely in your
              browser.
            </p>

            {/* Feature badges */}
            <div className='mt-6 flex flex-wrap justify-center gap-2'>
              <div className='flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800 dark:bg-green-900 dark:text-green-200'>
                <Shield className='mr-1 h-3 w-3' />
                Privacy First
              </div>
              <div className='flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                <Zap className='mr-1 h-3 w-3' />
                Lightning Fast
              </div>
              <div className='flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800 dark:bg-purple-900 dark:text-purple-200'>
                <Sparkles className='mr-1 h-3 w-3' />
                Advanced Processing
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='space-y-8'>
            {/* Left Column - Upload & Settings */}
            <div className='space-y-6'>
              {/* Upload Area */}
              <div className='rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800'>
                <div className='mb-4 flex items-center justify-between'>
                  <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>Upload Image</h2>
                  {selectedImage && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={resetAll}
                          className='hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400'
                        >
                          <X className='mr-2 h-4 w-4' />
                          Clear
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove image and start over</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {!selectedImage ?
                  <div
                    className={cn(
                      'group relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300',
                      dragActive ?
                        'pulse-glow border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950'
                      : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-slate-500 dark:hover:bg-slate-800',
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
                      className='absolute inset-0 cursor-pointer opacity-0'
                      id='file-upload'
                    />
                    <div className='p-12 text-center'>
                      <div className='float-animation mb-4'>
                        <ImageIcon className='mx-auto h-16 w-16 text-slate-400 group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-blue-400' />
                      </div>
                      <p className='mb-2 text-lg font-medium text-slate-700 dark:text-slate-300'>
                        Drag and drop your image here
                      </p>
                      <p className='mb-6 text-sm text-slate-500 dark:text-slate-400'>
                        Supports JPG, PNG, WebP formats up to 10MB
                      </p>
                      <Button
                        asChild
                        className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      >
                        <label htmlFor='file-upload' className='cursor-pointer'>
                          <Upload className='mr-2 h-4 w-4' />
                          Choose Image
                        </label>
                      </Button>
                    </div>
                  </div>
                : <div className='relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700'>
                    <img src={selectedImage} alt='Original' className='h-96 w-full object-contain' />
                    <div className='absolute bottom-2 left-2 rounded-lg bg-black/70 px-2 py-1 text-xs text-white'>
                      Original
                    </div>
                  </div>
                }
              </div>

              {/* Settings Panel */}
              {selectedImage && (
                <div className='rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800'>
                  <div className='mb-6 flex items-center justify-between'>
                    <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>Processing Settings</h3>
                  </div>

                  <div className='space-y-6'>
                    <div className='grid gap-6 md:grid-cols-2'>
                      <div className='space-y-2'>
                        <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>Processing Speed</label>
                        <Select
                          value={device}
                          onValueChange={(value: 'cpu' | 'gpu') => setDevice(value)}
                          disabled={isProcessing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='cpu'>🐌 CPU (Compatible)</SelectItem>
                            <SelectItem value='gpu'>⚡ GPU (Faster)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>Output Format</label>
                        <Select
                          value={outputFormat}
                          onValueChange={(value: 'image/png' | 'image/jpeg' | 'image/webp') => setOutputFormat(value)}
                          disabled={isProcessing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='image/png'>🖼️ PNG (Default)</SelectItem>
                            <SelectItem value='image/jpeg'>📷 JPEG (Smaller)</SelectItem>
                            <SelectItem value='image/webp'>🌐 WebP (Modern)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>Processing Model</label>
                        <Select
                          value={model}
                          onValueChange={(value: 'isnet' | 'isnet_fp16' | 'isnet_quint8') => setModel(value)}
                          disabled={isProcessing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='isnet'>Default</SelectItem>
                            <SelectItem value='isnet_fp16'>FP16</SelectItem>
                            <SelectItem value='isnet_quint8'>QUINT8</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                          Quality: {Math.round(quality * 100)}%
                        </label>
                        <div className='space-y-1'>
                          <input
                            type='range'
                            min='0.1'
                            max='1'
                            step='0.1'
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className='h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-700'
                            disabled={isProcessing}
                          />
                          <div className='flex justify-between text-xs text-slate-500 dark:text-slate-400'>
                            <span>Smaller</span>
                            <span>Better</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='space-y-3'>
                      <Button
                        onClick={removeBackgroundFromImage}
                        disabled={isProcessing}
                        className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500'
                        size='lg'
                      >
                        {isProcessing ?
                          <>
                            <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                            Processing...
                          </>
                        : processedImage ?
                          <>
                            <Wand2 className='mr-2 h-4 w-4' />
                            Process Again
                          </>
                        : <>
                            <Sparkles className='mr-2 h-4 w-4' />
                            Remove Background
                          </>
                        }
                      </Button>

                      {processedImage && (
                        <Button
                          variant='outline'
                          onClick={() => setProcessedImage(null)}
                          disabled={isProcessing}
                          className='w-full'
                        >
                          <X className='mr-2 h-4 w-4' />
                          Clear Result
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Result */}
            <div className='space-y-6'>
              <div className='rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-800'>
                <div className='mb-4 flex items-center justify-between'>
                  <h2 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>Result</h2>
                  {processedImage && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={downloadImage} size='sm' className='bg-green-600 text-white hover:bg-green-700'>
                          <Download className='mr-2 h-4 w-4' />
                          Download
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download processed image</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                {processedImage ?
                  <div className='relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700'>
                    <div className='bg-checkerboard absolute inset-0' />
                    <img src={processedImage} alt='Processed' className='relative h-96 w-full object-contain' />
                    <div className='absolute bottom-2 left-2 rounded-lg bg-green-600/90 px-2 py-1 text-xs text-white'>
                      Background Removed
                    </div>
                  </div>
                : isProcessing ?
                  <div className='flex h-96 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900'>
                    <div className='text-center'>
                      <div className='mb-4'>
                        <div className='mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent' />
                      </div>
                      <p className='mb-2 text-lg font-medium text-slate-700 dark:text-slate-300'>Processing your image...</p>
                      {progress && (
                        <div className='mx-auto max-w-xs space-y-2 px-4'>
                          <Progress value={progress.progress} className='h-2' />
                          <p className='text-sm text-slate-600 dark:text-slate-400'>
                            {progress.stage} ({progress.progress}%)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                : <div className='flex h-96 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900'>
                    <div className='text-center'>
                      <div className='mb-4'>
                        <ImageIcon className='mx-auto h-16 w-16 text-slate-400 dark:text-slate-500' />
                      </div>
                      <p className='text-lg font-medium text-slate-700 dark:text-slate-300'>
                        Processed image will appear here
                      </p>
                      <p className='mt-2 text-sm text-slate-500 dark:text-slate-400'>
                        Upload an image and click &ldquo;Remove Background&rdquo; to get started
                      </p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          {/* Instructions Section */}
          <div className='mt-12 rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-800'>
            <div className='mb-6 text-center'>
              <h3 className='mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100'>How It Works</h3>
              <p className='text-slate-600 dark:text-slate-400'>
                Get professional background removal in just a few simple steps
              </p>
            </div>

            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              <div className='text-center'>
                <div className='mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
                  <span className='text-lg font-bold text-blue-600 dark:text-blue-400'>1</span>
                </div>
                <h4 className='mb-2 font-semibold text-slate-900 dark:text-slate-100'>Upload Image</h4>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  Drag and drop or click to select your image file
                </p>
              </div>

              <div className='text-center'>
                <div className='mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900'>
                  <span className='text-lg font-bold text-purple-600 dark:text-purple-400'>2</span>
                </div>
                <h4 className='mb-2 font-semibold text-slate-900 dark:text-slate-100'>Configure Settings</h4>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  Choose processing speed and output format that suits your needs
                </p>
              </div>

              <div className='text-center'>
                <div className='mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900'>
                  <span className='text-lg font-bold text-green-600 dark:text-green-400'>3</span>
                </div>
                <h4 className='mb-2 font-semibold text-slate-900 dark:text-slate-100'>Download Result</h4>
                <p className='text-sm text-slate-600 dark:text-slate-400'>
                  Get your image with background removed instantly
                </p>
              </div>
            </div>

            <div className='mt-8 rounded-xl bg-slate-50 p-4 dark:bg-slate-900'>
              <div className='flex items-start space-x-3'>
                <Shield className='mt-0.5 h-5 w-5 text-green-600 dark:text-green-400' />
                <div>
                  <h4 className='font-semibold text-slate-900 dark:text-slate-100'>Privacy & Security</h4>
                  <p className='mt-1 text-sm text-slate-600 dark:text-slate-400'>
                    All image processing happens directly in your browser using WebAssembly. Your images never leave your
                    device, ensuring complete privacy and security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
