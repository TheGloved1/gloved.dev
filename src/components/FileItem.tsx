'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import glovedApi, { type FileInfo } from '@/lib/glovedapi';
import { cn } from '@/lib/utils';
import {
  Calendar,
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
import VideoPreview from './VideoPreview';

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

  const fileUrl = glovedApi.getFileDownloadUrl(file.name);
  const previewUrl = glovedApi.getFileViewUrl(file.name);
  const isMobile = useIsMobile();
  const isImage = file.name.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const isVideo = file.name.match(/\.(mp4|webm|ogg|mov|avi)$/i);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
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
            'group relative rounded-2xl border border-border/20 bg-gradient-to-br from-background to-background/95 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-border/40 hover:shadow-2xl md:p-6 lg:p-8',
            file.isTemp && 'border-orange-200/50 from-orange-50/30 to-orange-50/10',
            className,
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role='article'
          aria-label={`File: ${file.name}, Size: ${file.size}, Uploaded: ${formatDate(file.createdAt)}`}
        >
          {/* File Header */}
          <div className='mb-2 flex items-start justify-between gap-2 md:gap-4'>
            <div className='flex min-w-0 flex-1 items-center gap-2 md:gap-4'>
              {/* File Icon */}
              <div
                className={cn(
                  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg shadow-sm transition-all duration-300 md:h-8 md:w-8 md:rounded-xl lg:h-10 lg:w-10',
                  file.isTemp ?
                    'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-orange-500/20'
                  : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-blue-500/20',
                )}
              >
                {getFileTypeIcon(file.name)}
              </div>

              {/* File Info */}
              <div className='min-w-0 flex-1'>
                <h3
                  className='font-display mb-1 truncate text-sm font-semibold text-foreground md:text-base lg:text-lg'
                  title={file.name}
                >
                  {file.name}
                </h3>
                <div className='flex items-center gap-2 text-xs text-muted-foreground md:gap-3 md:text-sm'>
                  <div className='flex items-center gap-1'>
                    <HardDrive className='h-3 w-3 flex-shrink-0 md:h-3.5 md:w-3.5' />
                    <span className='min-w-[2.5rem] text-xs sm:min-w-[3rem] md:text-sm'>{file.size}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <Calendar className='h-3 w-3 flex-shrink-0 md:h-3.5 md:w-3.5' />
                    <span className='hidden text-xs sm:inline md:text-sm'>{formatDate(file.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Temporary Badge */}
            {file.isTemp && (
              <div className='flex-shrink-0 rounded-full border border-orange-200 bg-gradient-to-r from-orange-100 to-orange-50 px-2 py-1 md:px-3 md:py-1.5'>
                <span className='text-xs font-semibold text-orange-700'>24h</span>
              </div>
            )}
          </div>

          {/* Action Buttons - Desktop */}
          <div
            className={cn(
              'flex items-center gap-1 transition-opacity duration-300 md:gap-2',
              isHovered ? 'opacity-100' : 'opacity-0',
            )}
          >
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowDialog(true)}
              className='h-7 w-7 rounded-lg transition-colors hover:bg-accent/80 md:h-9 md:w-9'
              aria-label={`Preview ${file.name}`}
            >
              <Eye className='h-3.5 w-3.5 md:h-4 md:w-4' />
            </Button>

            <Button
              variant='ghost'
              size='sm'
              onClick={handleCopyUrl}
              className='h-7 w-7 rounded-lg transition-colors hover:bg-accent/80 md:h-9 md:w-9'
              aria-label={`Copy URL for ${file.name}`}
            >
              <Copy className='h-3.5 w-3.5 md:h-4 md:w-4' />
            </Button>

            <Button
              variant='ghost'
              size='sm'
              onClick={handleDownload}
              className='h-7 w-7 rounded-lg transition-colors hover:bg-accent/80 md:h-9 md:w-9'
              aria-label={`Download ${file.name}`}
            >
              <Download className='h-3.5 w-3.5 md:h-4 md:w-4' />
            </Button>

            <Button
              variant='ghost'
              size='sm'
              onClick={() => onDelete(file)}
              className='h-7 w-7 rounded-lg text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive md:h-9 md:w-9'
              aria-label={`Delete ${file.name}`}
            >
              <Trash2 className='h-3.5 w-3.5 md:h-4 md:w-4' />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Layout - List */}
      {isMobile && (
        <div
          className={cn(
            'group w-full rounded-lg border border-border/20 bg-gradient-to-br from-background to-background/95 p-2 backdrop-blur-sm transition-all duration-300 hover:border-border/40 hover:shadow-md md:rounded-xl md:p-3 md:hover:shadow-lg',
            file.isTemp && 'border-orange-200/50 from-orange-50/30 to-orange-50/10',
            className,
          )}
          role='article'
          aria-label={`File: ${file.name}, Size: ${file.size}, Uploaded: ${formatDate(file.createdAt)}`}
        >
          {/* Mobile Header */}
          <div className='mb-1 flex items-center justify-between gap-1 md:mb-2 md:gap-2'>
            <div className='flex min-w-0 flex-1 items-center gap-1 md:gap-2'>
              {/* File Icon */}
              <div
                className={cn(
                  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg shadow-sm md:h-8 md:w-8',
                  file.isTemp ?
                    'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
                  : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white',
                )}
              >
                {getFileTypeIcon(file.name)}
              </div>

              {/* File Name */}
              <h3 className='font-display truncate text-xs font-semibold text-foreground md:text-sm' title={file.name}>
                {file.name}
              </h3>
            </div>

            {/* Mobile Menu */}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className='h-6 w-6 flex-shrink-0 rounded-lg p-0 md:h-8 md:w-8'
              aria-label='More options'
            >
              <MoreVertical className='h-3 w-3 md:h-4 md:w-4' />
            </Button>
          </div>

          {/* Mobile File Details */}
          <div className='mb-1 flex items-center justify-between text-xs text-muted-foreground md:mb-2'>
            <div className='flex items-center gap-1'>
              <HardDrive className='h-2.5 w-2.5 flex-shrink-0 md:h-3 md:w-3' />
              <span className='text-xs'>{file.size}</span>
            </div>
            {file.isTemp && (
              <div className='rounded-full bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700 md:px-2 md:py-0.5'>
                24h
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          {showMobileMenu && (
            <div className='flex gap-0.5 rounded-lg border border-border/20 bg-muted/50 p-1.5 md:gap-1 md:p-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setShowDialog(true);
                  setShowMobileMenu(false);
                }}
                className='h-6 flex-1 px-1 text-xs md:h-8 md:px-2'
              >
                <Eye className='mr-0.5 h-2.5 w-2.5 md:mr-1 md:h-3 md:w-3' />
                <span className='hidden sm:inline'>Preview</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  handleCopyUrl();
                  setShowMobileMenu(false);
                }}
                className='h-6 flex-1 px-1 text-xs md:h-8 md:px-2'
              >
                <Copy className='mr-0.5 h-2.5 w-2.5 md:mr-1 md:h-3 md:w-3' />
                <span className='hidden sm:inline'>Copy</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  handleDownload();
                  setShowMobileMenu(false);
                }}
                className='h-6 flex-1 px-1 text-xs md:h-8 md:px-2'
              >
                <Download className='mr-0.5 h-2.5 w-2.5 md:mr-1 md:h-3 md:w-3' />
                <span className='hidden sm:inline'>Download</span>
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => {
                  onDelete(file);
                  setShowMobileMenu(false);
                }}
                className='h-6 flex-1 px-1 text-xs md:h-8 md:px-2'
              >
                <Trash2 className='mr-0.5 h-2.5 w-2.5 md:mr-1 md:h-3 md:w-3' />
                <span className='hidden sm:inline'>Delete</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='font-display flex items-center gap-4 text-xl'>
              <div
                className={cn(
                  'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-sm',
                  file.isTemp ?
                    'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-orange-500/20'
                  : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-blue-500/20',
                )}
              >
                {getFileTypeIcon(file.name)}
              </div>
              <div className='min-w-0 flex-1'>
                <div className='truncate text-lg font-semibold' title={file.name}>
                  {file.name}
                </div>
                {file.isTemp && (
                  <div className='text-sm text-orange-600 dark:text-orange-400'>Temporary file (expires in 24 hours)</div>
                )}
              </div>
            </DialogTitle>
            <DialogDescription className='flex flex-wrap gap-6 text-sm'>
              <div className='flex items-center gap-2'>
                <HardDrive className='h-4 w-4' />
                <span className='font-medium'>{file.size}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span className='font-medium'>{formatDate(file.createdAt)}</span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className='mt-6'>
            {/* Preview Content */}
            <div className='flex items-center justify-center'>
              {isImage && (
                <div className='relative overflow-hidden rounded-2xl border-2 border-border/20 shadow-2xl'>
                  <Image
                    width={isMobile ? 300 : 600}
                    height={isMobile ? 300 : 600}
                    src={previewUrl}
                    alt={file.name}
                    className='h-auto max-w-full object-contain'
                  />
                </div>
              )}
              {isVideo && (
                <div className='w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-border/20 shadow-2xl'>
                  <VideoPreview className='w-full' src={previewUrl} />
                </div>
              )}
              {!isImage && !isVideo && (
                <div className='flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed border-border/40 p-12'>
                  <div
                    className={cn(
                      'flex h-20 w-20 items-center justify-center rounded-2xl',
                      file.isTemp ?
                        'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-orange-500/20'
                      : 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-blue-500/20',
                    )}
                  >
                    {getFileTypeIcon(file.name)}
                  </div>
                  <p className='text-center font-medium text-muted-foreground'>Preview not available for this file type</p>
                </div>
              )}
            </div>

            {/* Dialog Actions */}
            <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
              <Button onClick={handleCopyUrl} className='h-12 flex-1 font-semibold' variant='outline'>
                <Copy className='mr-2 h-5 w-5' />
                Copy URL
              </Button>
              <Button onClick={handleDownload} className='h-12 flex-1 font-semibold'>
                <Download className='mr-2 h-5 w-5' />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
