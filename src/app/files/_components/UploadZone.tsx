'use client';
import { CornerDecorations } from '@/components/CornerDecorations';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { FileIcon, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UploadZoneProps {
  onUpload: (file: File, isTemp: boolean) => void;
  uploadProgress: number;
  isUploading: boolean;
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
  onCancelUpload,
  className,
}: UploadZoneProps): React.JSX.Element {
  const [isTemp, setIsTemp] = useState(false);
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
            <h2 className='font-display glitch-text text-2xl font-bold uppercase tracking-tight lg:text-3xl'>
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

      {/* Temporary File Toggle */}
      <div
        className={cn(
          'group flex cursor-pointer items-center justify-between border transition-all duration-300',
          'border-white/10 bg-white/5 p-4 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5',
        )}
        onClick={() => {
          setIsTemp(!isTemp);
        }}
      >
        <div className='space-y-1'>
          <Label htmlFor='temp-file' className='font-display text-sm font-medium uppercase tracking-wide text-white'>
            Temporary File
          </Label>
          <p className='font-mono-industrial text-xs text-white/50'>Files will be automatically deleted after 24 hours</p>
        </div>
        <Switch
          className={cn('transition-colors', isTemp ? 'group-hover:bg-fuchsia-500/50' : 'group-hover:bg-white/50')}
          id='temp-file'
          checked={isTemp}
          onCheckedChange={setIsTemp}
          disabled={isUploading}
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className='space-y-3 border border-fuchsia-500/30 bg-fuchsia-500/5 p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <div className='glow-line h-2 w-2 animate-pulse rounded-full bg-fuchsia-500' />
              <span className='font-mono-industrial text-sm font-medium text-white'>UPLOADING...</span>
            </div>
            <span className='font-mono-industrial text-sm text-fuchsia-400'>{uploadProgress}%</span>
          </div>

          <div className='h-2 w-full overflow-hidden rounded-full bg-white/10'>
            <div
              className='h-full bg-gradient-to-r from-purple-600 to-purple-800 transition-all duration-300 ease-out'
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <div className='flex justify-end'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleCancel}
              className='brutal-shadow-sm border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400 hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
            >
              <X className='mr-2 h-4 w-4' />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Selected File Info */}
      {selectedFile && !isUploading && (
        <div className='flex items-center justify-between border border-fuchsia-500/30 bg-fuchsia-500/5 p-4'>
          <div className='flex items-center space-x-3'>
            <div className='glow-line h-5 w-5 text-fuchsia-400' />
            <div>
              <p className='font-mono-industrial text-sm font-medium text-white'>{selectedFile.name}</p>
              <p className='font-mono-industrial text-xs text-fuchsia-400/70'>{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Upload Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className='brutal-shadow max-h-[95vh] w-full max-w-md overflow-y-auto border border-fuchsia-500/30 bg-fuchsia-500/5'>
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
                <Switch id='temp-file-dialog' checked={isTemp} onCheckedChange={setIsTemp} disabled={isUploading} />
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
