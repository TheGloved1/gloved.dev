'use client';

import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { removeBackground } from '@imgly/background-removal';

export type Device = 'cpu' | 'gpu';
export type Model = 'isnet' | 'isnet_fp16' | 'isnet_quint8';
export type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export interface ProgressState {
  progress: number;
  stage: string;
}

interface BGRemoverContextType {
  // State
  selectedImage: string | null;
  processedImage: string | null;
  isProcessing: boolean;
  progress: ProgressState | null;
  dragActive: boolean;
  device: Device;
  model: Model;
  outputFormat: OutputFormat;
  quality: number;
  copyFeedback: boolean;
  imglyPath: string | undefined;

  // Actions
  setSelectedImage: (value: string | null) => void;
  setProcessedImage: (value: string | null) => void;
  setIsProcessing: (value: boolean) => void;
  setProgress: (value: ProgressState | null) => void;
  setDragActive: (value: boolean) => void;
  setDevice: (value: Device) => void;
  setModel: (value: Model) => void;
  setOutputFormat: (value: OutputFormat) => void;
  setQuality: (value: number) => void;
  setCopyFeedback: (value: boolean) => void;

  // Handlers
  handleFileSelect: (file: File) => void;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeBackgroundFromImage: () => Promise<void>;
  copyImageToClipboard: () => Promise<void>;
  downloadImage: () => void;
  cancelProcessing: () => void;
  resetAll: () => void;

  // Refs
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const BGRemoverContext = createContext<BGRemoverContextType | undefined>(undefined);

export function useBGRemover() {
  const context = useContext(BGRemoverContext);
  if (context === undefined) {
    throw new Error('useBGRemover must be used within a BGRemoverProvider');
  }
  return context;
}

interface BGRemoverProviderProps {
  children: ReactNode;
}

export function BGRemoverProvider({ children }: BGRemoverProviderProps) {
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

  const value = useMemo(
    () => ({
      selectedImage,
      processedImage,
      isProcessing,
      progress,
      dragActive,
      device,
      model,
      outputFormat,
      quality,
      copyFeedback,
      imglyPath,
      setSelectedImage,
      setProcessedImage,
      setIsProcessing,
      setProgress,
      setDragActive,
      setDevice,
      setModel,
      setOutputFormat,
      setQuality,
      setCopyFeedback,
      handleFileSelect,
      handleDrag,
      handleDrop,
      handleFileInput,
      removeBackgroundFromImage,
      copyImageToClipboard,
      downloadImage,
      cancelProcessing,
      resetAll,
      fileInputRef,
    }),
    [
      selectedImage,
      processedImage,
      isProcessing,
      progress,
      dragActive,
      device,
      model,
      outputFormat,
      quality,
      copyFeedback,
      imglyPath,
      setSelectedImage,
      setProcessedImage,
      handleFileSelect,
      handleDrag,
      handleDrop,
      handleFileInput,
      removeBackgroundFromImage,
      copyImageToClipboard,
      downloadImage,
      cancelProcessing,
      resetAll,
    ],
  );

  return <BGRemoverContext.Provider value={value}>{children}</BGRemoverContext.Provider>;
}
