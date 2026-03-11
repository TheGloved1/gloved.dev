'use client';
import { CornerDecorations } from '@/components/CornerDecorations';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { CheckCircle2, FileIcon, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UploadZoneProps {
  onUpload: (file: File, isTemp: boolean) => void;
  uploadProgress: number;
  isUploading: boolean;
  isTemp: boolean;
  onTempChange?: (isTemp: boolean) => void;
  onCancelUpload: () => void;
  className?: string;
}

interface DragState {
  isDragActive: boolean;
  isDragReject: boolean;
}

export default function UploadZone({
  onUpload,
  uploadProgress,
  isUploading,
  isTemp,
  onTempChange,
  onCancelUpload,
  className,
}: UploadZoneProps): React.JSX.Element {
  const [dragState, setDragState] = useState<DragState>({
    isDragActive: false,
    isDragReject: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [hovering, setHovering] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const hasFiles = Array.from(items).some((item) => item.kind === 'file');
      setDragState({
        isDragActive: hasFiles,
        isDragReject: !hasFiles,
      });
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({ isDragActive: false, isDragReject: false });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setDragState({ isDragActive: false, isDragReject: false });

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const parts = file.name.split('.');
      const baseName = parts.length > 1 ? parts.slice(0, -1).join('.') : file.name;
      setPendingFile(file);
      setFileName(baseName);
      setShowConfirmDialog(true);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const parts = file.name.split('.');
      const baseName = parts.length > 1 ? parts.slice(0, -1).join('.') : file.name;
      setPendingFile(file);
      setFileName(baseName);
      setShowConfirmDialog(true);
    }
  }, []);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const parts = file.name.split('.');
          const baseName = parts.length > 1 ? parts.slice(0, -1).join('.') : file.name;
          setPendingFile(file);
          setFileName(baseName);
          setShowConfirmDialog(true);
        }
        break;
      }
    }
  }, []);

  const getFinalFileName = useCallback((inputName: string, originalName: string): string => {
    const originalParts = originalName.split('.');
    const originalExtension = originalParts.length > 1 ? '.' + originalParts.pop() : '';

    let finalName = inputName.trim();
    if (originalExtension && !finalName.toLowerCase().endsWith(originalExtension.toLowerCase())) {
      finalName += originalExtension;
    }

    return finalName;
  }, []);

  const handleConfirmUpload = useCallback(async () => {
    if (pendingFile && fileName.trim()) {
      const finalName = getFinalFileName(fileName, pendingFile.name);

      // Create new file with custom name
      const renamedFile = new File([pendingFile], finalName);

      setSelectedFile(renamedFile);
      onUpload(renamedFile, isTemp);
      setShowConfirmDialog(false);
      setPendingFile(null);
      setFileName('');
    }
  }, [pendingFile, fileName, onUpload, isTemp, getFinalFileName]);

  const handleCancelUpload = useCallback(() => {
    setShowConfirmDialog(false);
    setPendingFile(null);
    setFileName('');
  }, []);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onCancelUpload();
  }, [onCancelUpload]);

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = bytes;

    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }

    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
  };

  useEffect(() => {
    const handlePasteEvent = (e: ClipboardEvent) => handlePaste(e);
    document.addEventListener('paste', handlePasteEvent);
    return () => document.removeEventListener('paste', handlePasteEvent);
  }, [handlePaste]);

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Upload Zone */}
      <div
        className={cn(
          'group relative h-full w-full border-2 border-dashed transition-all duration-300',
          dragState.isDragActive ? 'border-fuchsia-500 bg-fuchsia-500/5' : 'border-white/20 hover:border-white/40',
          isUploading && 'pointer-events-none opacity-50',
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        role='button'
        tabIndex={0}
        aria-label='Drop files here or click to upload'
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleButtonClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type='file'
          onChange={handleFileSelect}
          className='absolute inset-0 z-10 cursor-pointer opacity-0'
          aria-label='Select file to upload'
          disabled={isUploading}
        />

        {/* Corner decorations */}
        <CornerDecorations hovering={hovering} />

        <div className='flex h-full flex-col items-center justify-center p-8'>
          <div
            className={cn(
              'mb-6 flex h-20 w-20 items-center justify-center border transition-all duration-300',
              dragState.isDragActive ? 'border-fuchsia-500 bg-fuchsia-500/10' : 'border-white/10 bg-white/5',
            )}
          >
            {dragState.isDragReject ?
              <X className='h-10 w-10 text-red-400' />
            : <Upload
                className={cn('h-10 w-10 transition-colors', dragState.isDragActive ? 'text-fuchsia-400' : 'text-white/30')}
              />
            }
          </div>

          <div className='text-center'>
            <h2 className='font-display text-2xl font-bold uppercase tracking-tight lg:text-3xl'>
              {dragState.isDragActive ? 'DROP YOUR FILE' : 'UPLOAD FILE'}
            </h2>
            <p className='font-mono-industrial mt-3 text-xs text-white/50'>
              {dragState.isDragReject ? 'FILES ONLY' : 'CLICK ANYWHERE • PASTE WITH CTRL+V'}
            </p>
            {!isUploading && (
              <Button
                onClick={handleButtonClick}
                variant='outline'
                className='brutal-shadow-sm mt-6 border-white/20 bg-white/5 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
              >
                <FileIcon className='mr-2 h-4 w-4' />
                Choose File
              </Button>
            )}
          </div>
        </div>

        {dragState.isDragActive && (
          <div className='absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent' />
        )}
      </div>

      {/* Upload Progress - Full Overlay */}
      {isUploading && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'>
          <div className='brutal-shadow-lg mx-4 w-full max-w-md space-y-6 rounded-2xl border border-fuchsia-500/30 bg-fuchsia-500/5 p-8'>
            {/* Animated Icon */}
            <div className='flex justify-center'>
              <div className='relative'>
                <div className='flex h-16 w-16 items-center justify-center rounded-full border-2 border-fuchsia-500/30 bg-fuchsia-500/10'>
                  <Upload className='h-8 w-8 animate-pulse text-fuchsia-400' />
                </div>
                {/* Rotating ring */}
                <div className='absolute inset-0 flex h-16 w-16 items-center justify-center'>
                  <div className='h-14 w-14 animate-spin rounded-full border-2 border-transparent border-t-fuchsia-500' />
                </div>
              </div>
            </div>

            {/* Progress Info */}
            <div className='space-y-4 text-center'>
              <h2 className='font-display text-2xl font-bold uppercase tracking-tight text-white'>UPLOADING FILE</h2>

              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span className='font-mono-industrial text-white/80'>Progress</span>
                  <span className='font-mono-industrial font-bold text-fuchsia-400'>{uploadProgress}%</span>
                </div>

                {/* Large Progress Bar */}
                <div className='h-4 w-full overflow-hidden rounded-full border border-white/20 bg-white/10'>
                  <div
                    className='relative h-full overflow-hidden bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-300 ease-out'
                    style={{ width: `${uploadProgress}%` }}
                  >
                    {/* Animated shimmer effect */}
                    <div className='absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent' />
                  </div>
                </div>

                <p className='font-mono-industrial text-xs text-white/50'>
                  Please wait while your file is being uploaded...
                </p>
              </div>

              {/* File Info */}
              {selectedFile && (
                <div className='rounded-lg border border-white/10 bg-white/5 p-3'>
                  <p className='font-mono-industrial truncate text-xs text-white'>{selectedFile.name}</p>
                  <p className='font-mono-industrial mt-1 text-xs text-fuchsia-400/70'>
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              )}
            </div>

            {/* Cancel Button */}
            <div className='flex justify-center'>
              <Button
                variant='outline'
                onClick={handleCancel}
                className='brutal-shadow-sm border-red-500/50 bg-red-500/10 text-red-400 transition-all duration-300 hover:border-red-500 hover:bg-red-500/20 hover:text-red-300'
              >
                <X className='mr-2 h-4 w-4' />
                Cancel Upload
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Selected File Info */}
      {selectedFile && !isUploading && (
        <div className='flex items-center justify-between border border-fuchsia-500/30 bg-fuchsia-500/5 p-4'>
          <div className='flex items-center space-x-3'>
            <CheckCircle2 className='h-5 w-5 text-fuchsia-400' />
            <div>
              <p className='font-mono-industrial text-sm font-medium text-white'>{selectedFile.name}</p>
              <p className='font-mono-industrial text-xs text-fuchsia-400/70'>{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <Button variant='outline' onClick={() => setSelectedFile(null)} className='border-red-500/50 bg-red-500/10'>
            <X className='h-2 w-2 text-red-400' />
          </Button>
        </div>
      )}

      {/* Confirm Upload Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className='brutal-shadow max-h-[95vh] w-full max-w-md overflow-y-auto border border-fuchsia-500/30 bg-fuchsia-500/15'>
          <DialogHeader className='space-y-4'>
            <DialogTitle className='font-display text-lg font-bold uppercase tracking-wide text-white'>
              Confirm Upload
            </DialogTitle>
            <p className='font-mono-industrial text-sm text-white/50'>Do you want to upload this file?</p>
          </DialogHeader>

          {pendingFile && (
            <div className='space-y-4'>
              <div className='flex items-center space-x-3 border border-fuchsia-500/30 bg-fuchsia-500/5 p-3'>
                <FileIcon className='h-8 w-8 text-fuchsia-400' />
                <div className='min-w-0 flex-1'>
                  <Input
                    value={fileName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFileName(e.target.value)}
                    placeholder='Enter file name'
                    className='font-mono-industrial border-0 bg-transparent p-0 text-sm font-medium text-white placeholder:text-fuchsia-400/30 focus-visible:ring-fuchsia-500/20'
                    disabled={isUploading}
                  />
                  <p className='font-mono-industrial mt-1 text-xs text-fuchsia-400'>{formatFileSize(pendingFile.size)}</p>
                  {fileName && getFinalFileName(fileName, pendingFile.name) !== fileName && (
                    <p className='font-mono-industrial text-xs text-white/50'>
                      Will be saved as:{' '}
                      <span className='text-fuchsia-400'>{getFinalFileName(fileName, pendingFile.name)}</span>
                    </p>
                  )}
                  {pendingFile.name !== fileName && fileName && (
                    <p className='font-mono-industrial text-xs italic text-white/30'>Original: {pendingFile.name}</p>
                  )}
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <Label
                  htmlFor='temp-file-dialog'
                  className='font-display text-sm font-medium uppercase tracking-wide text-white'
                >
                  Temporary File
                </Label>
                <Switch
                  id='temp-file-dialog'
                  checked={isTemp}
                  onCheckedChange={(checked) => {
                    localStorage.setItem('temp', String(checked));
                    onTempChange?.(checked);
                  }}
                  disabled={isUploading}
                />
                <span className='font-mono-industrial text-xs text-white/50'>(auto-delete after 24h)</span>
              </div>

              <div className='flex gap-2 pt-2'>
                <Button
                  variant='outline'
                  onClick={handleCancelUpload}
                  className='brutal-shadow-sm flex-1 border border-fuchsia-500/50 bg-fuchsia-500/10 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-white'
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUpload}
                  className='brutal-shadow flex-1 border-fuchsia-500 bg-fuchsia-500 text-white hover:border-fuchsia-400 hover:bg-fuchsia-600'
                  disabled={isUploading || !fileName.trim()}
                >
                  Upload
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
