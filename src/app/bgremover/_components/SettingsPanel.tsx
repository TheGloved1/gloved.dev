'use client';

import { cn } from '@/lib/utils';
import { Cpu, Zap } from 'lucide-react';
import { memo, useCallback } from 'react';
import type { Device, Model, OutputFormat } from '../types';

interface SettingsPanelProps {
  device: Device;
  model: Model;
  outputFormat: OutputFormat;
  quality: number;
  isProcessing: boolean;
  onDeviceChange: (device: Device) => void;
  onModelChange: (model: Model) => void;
  onFormatChange: (format: OutputFormat) => void;
  onQualityChange: (quality: number) => void;
}

export const SettingsPanel = memo(function SettingsPanel({
  device,
  model,
  outputFormat,
  quality,
  isProcessing,
  onDeviceChange,
  onModelChange,
  onFormatChange,
  onQualityChange,
}: SettingsPanelProps) {
  const handleQualityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onQualityChange(Number(e.target.value));
    },
    [onQualityChange],
  );

  return (
    <div className='flex flex-col gap-3 overflow-y-auto'>
      <div className='border border-white/10 bg-white/[0.02] p-4'>
        <h3 className='font-display mb-4 text-[10px] font-bold uppercase tracking-wider text-white/50'>CONFIG</h3>

        <div className='space-y-4'>
          {/* Device */}
          <div className='space-y-1.5'>
            <label className='font-mono-industrial text-[10px] text-white/40'>PROCESSING</label>
            <div className='grid grid-cols-2 gap-1.5'>
              <button
                onClick={() => onDeviceChange('cpu')}
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
                onClick={() => onDeviceChange('gpu')}
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
                  onClick={() => onFormatChange(format)}
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
                  onClick={() => onModelChange(m)}
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
              <span className='font-mono-industrial text-[10px] text-fuchsia-400'>{Math.round(quality * 100)}%</span>
            </div>
            <input
              type='range'
              min='0.1'
              max='1'
              step='0.1'
              value={quality}
              onChange={handleQualityChange}
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
  );
});
