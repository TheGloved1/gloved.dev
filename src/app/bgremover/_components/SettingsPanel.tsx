'use client';

import { cn } from '@/lib/utils';
import { Cpu, Zap } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useBGRemover } from './BGRemoverContext';

export const SettingsPanel = memo(function SettingsPanel() {
  const {
    device,
    model,
    outputFormat,
    quality,
    removalMode,
    isProcessing,
    setDevice,
    setModel,
    setOutputFormat,
    setQuality,
    setRemovalMode,
    resetToDefaults,
  } = useBGRemover();
  const handleQualityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuality(Number(e.target.value));
    },
    [setQuality],
  );

  return (
    <div className='flex flex-col gap-3 overflow-y-auto'>
      <div className='border border-white/10 bg-white/[0.02] p-4'>
        <h3 className='font-display mb-4 text-[10px] font-bold uppercase tracking-wider text-white/50'>CONFIG</h3>

        <div className='space-y-4'>
          {/* Removal Mode */}
          <div className='space-y-1.5'>
            <label className='font-mono-industrial text-[10px] text-white/40'>REMOVAL MODE</label>
            <div className='grid grid-cols-2 gap-1.5'>
              <button
                onClick={() => setRemovalMode('background')}
                disabled={isProcessing}
                className={cn(
                  'font-mono-industrial flex items-center justify-center gap-1.5 border p-2 text-[10px] uppercase transition-all disabled:opacity-50',
                  removalMode === 'background' ?
                    'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400'
                  : 'border-white/10 text-white/50 hover:border-white/30',
                )}
              >
                BACKGROUND
              </button>
              <button
                onClick={() => setRemovalMode('foreground')}
                disabled={isProcessing}
                className={cn(
                  'font-mono-industrial flex items-center justify-center gap-1.5 border p-2 text-[10px] uppercase transition-all disabled:opacity-50',
                  removalMode === 'foreground' ?
                    'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400'
                  : 'border-white/10 text-white/50 hover:border-white/30',
                )}
              >
                FOREGROUND
              </button>
            </div>
          </div>

          {/* Device */}
          <div className='space-y-1.5'>
            <label className='font-mono-industrial text-[10px] text-white/40'>PROCESSING</label>
            <div className='grid grid-cols-2 gap-1.5'>
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

          {/* Reset to Defaults */}
          <button
            onClick={resetToDefaults}
            disabled={isProcessing}
            className='font-mono-industrial mt-4 w-full border border-white/10 p-2 text-[10px] uppercase text-white/50 transition-all hover:border-red-500/50 hover:text-red-400 disabled:opacity-50'
          >
            RESET DEFAULTS
          </button>
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
