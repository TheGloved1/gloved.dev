'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import glovedApi, { type FileInfo } from '@/lib/glovedapi';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Check,
  Copy,
  Download,
  Eye,
  File,
  FileText,
  HardDrive,
  Image as ImageIcon,
  MoreVertical,
  Music,
  Trash2,
  VideoIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import VideoPreview from '../../../components/VideoPreview';

interface FileItemProps {
  file: FileInfo;
  onDelete: (file: FileInfo) => void;
  className?: string;
}

const getFileTypeIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (['jpeg', 'jpg', 'gif', 'png', 'webp', 'svg'].includes(extension || '')) {
    return <ImageIcon className='h-4 w-4' />;
  }
  if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(extension || '')) {
    return <VideoIcon className='h-4 w-4' />;
  }
  if (['mp3', 'wav', 'flac'].includes(extension || '')) {
    return <Music className='h-4 w-4' />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
    return <File className='h-4 w-4' />;
  }
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(extension || '')) {
    return <FileText className='h-4 w-4' />;
  }

  return <File className='h-4 w-4' />;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function FileItem({ file, onDelete, className }: FileItemProps): React.JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fileUrl = glovedApi.getFileDownloadUrl(file.name);
  const previewUrl = glovedApi.getFileViewUrl(file.name);
  const isMobile = useIsMobile();
  const isImage = file.name.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const isVideo = file.name.match(/\.(mp4|webm|ogg|mov|avi)$/i);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000);
      setShowDialog(false);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Desktop Layout - Card */}
      {!isMobile && (
        <div
          className={cn(
            'group relative border transition-all duration-300',
            'border-white/10 bg-white/5 p-4 backdrop-blur-sm hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5',
            file.isTemp && 'border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50 hover:bg-orange-500/10',
            'brutal-shadow-sm',
            className,
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role='article'
          aria-label={`File: ${file.name}, Size: ${file.size}, Uploaded: ${formatDate(file.createdAt)}`}
        >
          {/* File Header */}
          <div className='mb-3 flex items-start justify-between gap-4'>
            <div className='flex min-w-0 flex-1 items-center gap-4'>
              {/* File Icon */}
              <div
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center border transition-all duration-300',
                  file.isTemp ?
                    'border-orange-500/50 bg-orange-500/10 text-orange-400'
                  : 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400',
                )}
              >
                {getFileTypeIcon(file.name)}
              </div>

              {/* File Info */}
              <div className='min-w-0 flex-1'>
                <h3
                  className='font-display glitch-text mb-1 truncate text-sm font-semibold uppercase tracking-wide text-white'
                  title={file.name}
                >
                  {file.name}
                </h3>
                <div className='font-mono-industrial flex items-center gap-4 text-xs text-white/50'>
                  <div className='flex items-center gap-1'>
                    <HardDrive className='h-3 w-3 flex-shrink-0' />
                    <span className='min-w-[3rem]'>{file.size.replaceAll(' ', '')}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Calendar className='h-3 w-3 flex-shrink-0' />
                    <span>{formatDate(file.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Temporary Badge */}
            {file.isTemp && (
              <div className='flex-shrink-0 rounded-full border border-orange-500/50 bg-orange-500/10 px-2 py-1'>
                <span className='font-mono-industrial text-xs font-semibold text-orange-400'>24h</span>
              </div>
            )}
          </div>

          {/* Action Buttons - Desktop */}
          <div
            className={cn(
              'flex items-center gap-2 transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-0',
            )}
          >
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowDialog(true)}
              className='brutal-shadow-sm group relative h-8 w-8 overflow-hidden border border-fuchsia-500/40 bg-fuchsia-500/10 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
              aria-label={`Preview ${file.name}`}
            >
              <div className='absolute inset-0 left-0 right-0 top-0 h-full w-full bg-gradient-to-r from-fuchsia-500/40 via-fuchsia-500/40 to-transparent opacity-0 transition-all duration-300'></div>
              <Eye className='relative z-10 h-4 w-4' />
            </Button>

            <Button
              variant='ghost'
              size='sm'
              onClick={handleCopyUrl}
              className='brutal-shadow-sm group relative h-8 w-8 overflow-hidden border border-fuchsia-500/40 bg-fuchsia-500/10 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
              aria-label={`Copy URL for ${file.name}`}
            >
              <div className='absolute inset-0 left-0 right-0 top-0 h-full w-full bg-gradient-to-r from-fuchsia-500/40 via-fuchsia-500/40 to-transparent opacity-0 transition-all duration-300'></div>
              <div className='relative flex items-center justify-center'>
                <Copy
                  className={cn(
                    'h-4 w-4 transition-all duration-200',
                    isCopied ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
                  )}
                />
                <Check
                  className={cn(
                    'absolute inset-0 flex h-4 w-4 items-center justify-center text-green-400 transition-all duration-200',
                    isCopied ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
                  )}
                />
              </div>
            </Button>

            <Button
              variant='ghost'
              size='sm'
              onClick={handleDownload}
              className='brutal-shadow-sm group relative h-8 w-8 overflow-hidden border border-fuchsia-500/40 bg-fuchsia-500/10 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
              aria-label={`Download ${file.name}`}
            >
              <div className='absolute inset-0 left-0 right-0 top-0 h-full w-full bg-gradient-to-r from-fuchsia-500/40 via-fuchsia-500/40 to-transparent opacity-0 transition-all duration-300'></div>
              <Download className='relative z-10 h-4 w-4' />
            </Button>

            <Button
              variant='ghost'
              size='sm'
              onClick={() => onDelete(file)}
              className='brutal-shadow-sm group relative h-8 w-8 overflow-hidden border border-fuchsia-500/40 bg-fuchsia-500/10 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
              aria-label={`Delete ${file.name}`}
            >
              <div className='absolute inset-0 left-0 right-0 top-0 h-full w-full bg-gradient-to-r from-fuchsia-500/40 via-fuchsia-500/40 to-transparent opacity-0 transition-all duration-300'></div>
              <Trash2 className='relative z-10 h-4 w-4' />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Layout - List */}
      {isMobile && (
        <div
          className={cn(
            'group w-full border transition-all duration-300',
            'border-white/10 bg-white/5 p-3 backdrop-blur-sm hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5',
            file.isTemp && 'border-orange-500/30 bg-orange-500/5 hover:border-orange-500/50 hover:bg-orange-500/10',
            'brutal-shadow-sm',
            className,
          )}
          role='article'
          aria-label={`File: ${file.name}, Size: ${file.size}, Uploaded: ${formatDate(file.createdAt)}`}
        >
          {/* Mobile Header */}
          <div className='mb-2 flex items-center justify-between gap-2'>
            <div className='flex min-w-0 flex-1 items-center gap-2'>
              {/* File Icon */}
              <div
                className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center border transition-all duration-300',
                  file.isTemp ?
                    'border-orange-500/50 bg-orange-500/10 text-orange-400'
                  : 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400',
                )}
              >
                {getFileTypeIcon(file.name)}
              </div>

              {/* File Name */}
              <h3
                className='font-display text-glitch truncate text-sm font-semibold uppercase tracking-wide text-white'
                title={file.name}
              >
                {file.name}
              </h3>
            </div>

            {/* Mobile Menu */}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className='brutal-shadow-sm h-8 w-8 flex-shrink-0 border border-fuchsia-500/50 bg-fuchsia-500/10 p-0 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
              aria-label='More options'
            >
              <MoreVertical className='h-4 w-4' />
            </Button>
          </div>

          {/* Mobile File Details */}
          <div className='font-mono-industrial mb-2 flex items-center justify-between text-xs text-white/50'>
            <div className='flex items-center gap-1'>
              <HardDrive className='h-3 w-3 flex-shrink-0' />
              <span>{file.size}</span>
            </div>
            {file.isTemp && (
              <div className='rounded-full border border-orange-500/50 bg-orange-500/10 px-2 py-1'>
                <span className='text-xs font-semibold text-orange-400'>24h</span>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          {showMobileMenu && (
            <div className='flex gap-2 border border-white/10 bg-white/5 p-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setShowDialog(true);
                  setShowMobileMenu(false);
                }}
                className='brutal-shadow-sm flex-1 border border-white/20 bg-white/5 px-2 text-xs text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
              >
                <Eye className='mr-1 h-3 w-3' />
                <span>Preview</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  handleCopyUrl();
                  setShowMobileMenu(false);
                }}
                className='brutal-shadow-sm flex-1 border border-white/20 bg-white/5 px-2 text-xs text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
              >
                <Copy className='mr-1 h-3 w-3' />
                <span>Copy</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  handleDownload();
                  setShowMobileMenu(false);
                }}
                className='brutal-shadow-sm flex-1 border border-white/20 bg-white/5 px-2 text-xs text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
              >
                <Download className='mr-1 h-3 w-3' />
                <span>Download</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  onDelete(file);
                  setShowMobileMenu(false);
                }}
                className='brutal-shadow-sm flex-1 border border-red-500/50 bg-red-500/10 px-2 text-xs text-red-400 hover:border-red-500 hover:bg-red-500/10 hover:text-red-400'
              >
                <Trash2 className='mr-1 h-3 w-3' />
                <span>Delete</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className='brutal-shadow max-h-[95vh] w-full max-w-6xl overflow-y-auto border border-white/10 bg-black/90'>
          <DialogHeader className='space-y-4'>
            <DialogTitle className='font-display flex items-center gap-4 text-xl uppercase tracking-wide text-white'>
              <div
                className={cn(
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center border transition-all duration-300',
                  file.isTemp ?
                    'border-orange-500/50 bg-orange-500/10 text-orange-400'
                  : 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400',
                )}
              >
                {getFileTypeIcon(file.name)}
              </div>
              <div className='min-w-0 flex-1'>
                <div
                  className='font-display truncate text-lg font-semibold uppercase tracking-wide text-white'
                  title={file.name}
                >
                  {file.name}
                </div>
                {file.isTemp && (
                  <div className='font-mono-industrial text-xs text-orange-400'>Temporary file (expires in 24 hours)</div>
                )}
              </div>
            </DialogTitle>
            <div className='font-mono-industrial flex flex-wrap gap-6 text-sm text-white/50'>
              <div className='flex items-center gap-2'>
                <HardDrive className='h-4 w-4' />
                <span className='text-sm font-medium'>{file.size}</span>
              </div>
              <div className='flex items-center gap-1 sm:gap-2'>
                <Calendar className='h-3 w-3 sm:h-4 sm:w-4' />
                <span className='text-xs font-medium sm:text-sm'>{formatDate(file.createdAt)}</span>
              </div>
            </div>
          </DialogHeader>

          <div className='mt-4 sm:mt-6'>
            {/* Preview Content */}
            <div className='flex items-center justify-center'>
              {isImage && (
                <div className='relative max-h-[60vh] max-w-[90vw] overflow-hidden rounded-lg border border-border/20 shadow-lg sm:rounded-xl sm:shadow-2xl'>
                  <Image
                    width={isMobile ? 200 : 400}
                    height={isMobile ? 200 : 400}
                    src={previewUrl}
                    alt={file.name}
                    className='h-auto max-h-[50vh] max-w-full object-contain'
                  />
                </div>
              )}
              {isVideo && (
                <div className='max-h-[60vh] w-full max-w-[90vw] overflow-hidden rounded-lg border border-border/20 shadow-lg sm:rounded-xl sm:shadow-2xl'>
                  <VideoPreview className='h-auto max-h-[50vh] w-full' src={previewUrl} />
                </div>
              )}
              {!isImage && !isVideo && (
                <div className='flex max-w-[90vw] flex-col items-center gap-4 rounded-lg border-2 border-dashed border-border/40 p-6 sm:gap-6 sm:rounded-xl sm:p-8 md:p-12'>
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-lg sm:h-16 sm:w-16 sm:rounded-xl md:h-20 md:w-20',
                      file.isTemp ?
                        'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-orange-500/20'
                      : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-blue-500/20',
                    )}
                  >
                    {getFileTypeIcon(file.name)}
                  </div>
                  <p className='text-center text-xs font-medium text-muted-foreground sm:text-sm'>
                    Preview not available for this file type
                  </p>
                </div>
              )}
            </div>

            {/* Dialog Actions */}
            <div className='mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3'>
              <Button
                onClick={handleCopyUrl}
                className='h-10 flex-1 text-sm font-semibold sm:h-12 sm:text-base'
                variant='outline'
              >
                <Copy className='mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5' />
                <span className='hidden sm:inline'>Copy URL</span>
                <span className='sm:hidden'>Copy</span>
              </Button>
              <Button onClick={handleDownload} className='h-10 flex-1 text-sm font-semibold sm:h-12 sm:text-base'>
                <Download className='mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5' />
                <span className='hidden sm:inline'>Download</span>
                <span className='sm:hidden'>Get</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
