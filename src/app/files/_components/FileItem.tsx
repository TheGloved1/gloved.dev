'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import glovedApi, { type FileInfo } from '@/lib/glovedapi';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  Eye,
  File as FileIcon,
  FileText,
  HardDrive,
  Image as ImageIcon,
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
    return <FileIcon className='h-4 w-4' />;
  }
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(extension || '')) {
    return <FileText className='h-4 w-4' />;
  }

  return <FileIcon className='h-4 w-4' />;
};

const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (['jpeg', 'jpg', 'gif', 'png', 'webp', 'svg'].includes(extension || '')) {
    return 'images';
  }
  if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(extension || '')) {
    return 'videos';
  }
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(extension || '')) {
    return 'documents';
  }

  return 'other';
};

const getFileFilters = (file: FileInfo): { type: string; label: string; icon: React.ReactNode; color: string }[] => {
  const filters: { type: string; label: string; icon: React.ReactNode; color: string }[] = [];

  // Temporary/Permanent filter
  if (file.isTemp) {
    filters.push({
      type: 'temporary',
      label: '24h',
      icon: <Clock className='h-3 w-3' />,
      color: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    });
  } else {
    filters.push({
      type: 'permanent',
      label: 'Permanent',
      icon: <Calendar className='h-3 w-3' />,
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    });
  }

  // File type filters
  const fileType = getFileType(file.name);
  if (fileType === 'images') {
    filters.push({
      type: 'images',
      label: 'Image',
      icon: <span className='text-xs leading-none'>🖼️</span>,
      color: 'border-green-500/30 bg-green-500/10 text-green-400',
    });
  } else if (fileType === 'videos') {
    filters.push({
      type: 'videos',
      label: 'Video',
      icon: <span className='text-xs leading-none'>🎥</span>,
      color: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    });
  } else if (fileType === 'documents') {
    filters.push({
      type: 'documents',
      label: 'Document',
      icon: <span className='text-xs leading-none'>📄</span>,
      color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    });
  }

  return filters;
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

          {/* Action Buttons and Filter Tags Container - Desktop Only */}
          <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4'>
            {/* Action Buttons - Left Side on Large Screens, Left Side on Small Screens */}
            <div
              className={cn(
                'flex items-center gap-2 transition-opacity duration-300',
                isHovered ? 'opacity-100' : 'opacity-0',
                'md:order-1', // Always first on medium and up
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

            {/* Filter Tags - Right Side on Large Screens, Left Side on Small Screens */}
            <div className='flex flex-wrap gap-1.5 md:order-2'>
              {getFileFilters(file).map((filter) => (
                <div
                  key={filter.type}
                  className={cn(
                    'inline-flex items-center justify-center rounded-md border p-1.5 transition-all duration-200',
                    filter.color,
                    'hover:scale-105',
                  )}
                  title={filter.label}
                >
                  <span className='text-xs'>{filter.icon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Layout - List */}
      {isMobile && (
        <div
          className={cn(
            'group w-full border transition-all duration-300',
            'border-white/10 bg-white/5 backdrop-blur-sm hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5',
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
                  'xs:h-6 xs:w-6 sm:h-8 sm:w-8', // Responsive icon size
                  file.isTemp ?
                    'border-orange-500/50 bg-orange-500/10 text-orange-400'
                  : 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400',
                )}
              >
                <div className='xs:h-3 xs:w-3 sm:h-4 sm:w-4'>{getFileTypeIcon(file.name)}</div>
              </div>

              {/* File Name */}
              <h3
                className='font-display text-glitch truncate text-sm font-semibold uppercase tracking-wide text-white'
                style={{
                  fontSize: 'clamp(0.625rem, 2vw, 0.875rem)', // Responsive font size
                }}
                title={file.name}
              >
                {file.name}
              </h3>
            </div>
          </div>

          {/* Mobile File Details */}
          <div
            className='font-mono-industrial mb-2 flex items-center justify-between text-xs text-white/50'
            style={{
              fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)', // Responsive detail font
            }}
          >
            <div className='flex items-center gap-1'>
              <HardDrive className='xs:h-2 xs:w-2 h-3 w-3 flex-shrink-0 sm:h-3 sm:w-3' />
              <span>{file.size}</span>
            </div>
            {file.isTemp && (
              <div
                className='rounded-full border border-orange-500/50 bg-orange-500/10 px-2 py-1'
                style={{
                  padding: 'clamp(0.125rem, 0.5vw, 0.25rem) clamp(0.25rem, 1vw, 0.5rem)',
                  fontSize: 'clamp(0.5rem, 1.5vw, 0.625rem)',
                }}
              >
                <span className='text-xs font-semibold text-orange-400'>24h</span>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div
            className='grid grid-cols-2 gap-1.5 border border-white/10 bg-white/5 p-2'
            style={{
              gap: 'clamp(0.25rem, 1vw, 0.375rem)',
              padding: 'clamp(0.5rem, 1.5vw, 0.5rem)',
            }}
          >
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowDialog(true)}
              className='brutal-shadow-sm border border-white/20 bg-white/5 px-1 py-1.5 text-xs text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
              style={{
                padding: 'clamp(0.375rem, 1vw, 0.375rem) clamp(0.5rem, 1.5vw, 0.625rem)',
                fontSize: 'clamp(0.625rem, 2vw, 0.75rem)',
              }}
            >
              <Eye className='xs:h-2 xs:w-2 h-3 w-3 sm:h-3 sm:w-3' />
              <span className='xs:inline ml-1 hidden'>View</span>
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleCopyUrl}
              className='brutal-shadow-sm border border-white/20 bg-white/5 px-1 py-1.5 text-xs text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
              style={{
                padding: 'clamp(0.375rem, 1vw, 0.375rem) clamp(0.5rem, 1.5vw, 0.625rem)',
                fontSize: 'clamp(0.625rem, 2vw, 0.75rem)',
              }}
            >
              <Copy className='xs:h-2 xs:w-2 h-3 w-3 sm:h-3 sm:w-3' />
              <span className='xs:inline ml-1 hidden'>Copy</span>
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleDownload}
              className='brutal-shadow-sm border border-white/20 bg-white/5 px-1 py-1.5 text-xs text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
              style={{
                padding: 'clamp(0.375rem, 1vw, 0.375rem) clamp(0.5rem, 1.5vw, 0.625rem)',
                fontSize: 'clamp(0.625rem, 2vw, 0.75rem)',
              }}
            >
              <Download className='xs:h-2 xs:w-2 h-3 w-3 sm:h-3 sm:w-3' />
              <span className='xs:inline ml-1 hidden'>Get</span>
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => onDelete(file)}
              className='brutal-shadow-sm border border-red-500/50 bg-red-500/10 px-1 py-1.5 text-xs text-red-400 hover:border-red-500 hover:bg-red-500/10 hover:text-red-400'
              style={{
                padding: 'clamp(0.375rem, 1vw, 0.375rem) clamp(0.5rem, 1.5vw, 0.625rem)',
                fontSize: 'clamp(0.625rem, 2vw, 0.75rem)',
              }}
            >
              <Trash2 className='xs:h-2 xs:w-2 h-3 w-3 sm:h-3 sm:w-3' />
              <span className='xs:inline ml-1 hidden'>Del</span>
            </Button>
          </div>
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
