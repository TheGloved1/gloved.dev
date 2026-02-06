import type { Dispatch, SetStateAction } from 'react';

export type Device = 'cpu' | 'gpu';
export type Model = 'isnet' | 'isnet_fp16' | 'isnet_quint8';
export type OutputFormat = 'image/png' | 'image/jpeg' | 'image/webp';

export interface ProgressState {
  progress: number;
  stage: string;
}

export interface BGRemoverState {
  selectedImage: string | null;
  processedImage: string | null;
  isProcessing: boolean;
  progress: ProgressState | null;
  device: Device;
  model: Model;
  outputFormat: OutputFormat;
  quality: number;
  copyFeedback: boolean;
}

export interface BGRemoverActions {
  setSelectedImage: Dispatch<SetStateAction<string | null>>;
  setProcessedImage: Dispatch<SetStateAction<string | null>>;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
  setProgress: Dispatch<SetStateAction<ProgressState | null>>;
  setDevice: Dispatch<SetStateAction<Device>>;
  setModel: Dispatch<SetStateAction<Model>>;
  setOutputFormat: Dispatch<SetStateAction<OutputFormat>>;
  setQuality: Dispatch<SetStateAction<number>>;
  setCopyFeedback: Dispatch<SetStateAction<boolean>>;
}
