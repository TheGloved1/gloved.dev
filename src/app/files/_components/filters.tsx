import { type FileInfo } from '@/lib/glovedapi';
import { Calendar, Clock, FileIcon, FileText, HardDrive, ImageIcon, Music, VideoIcon } from 'lucide-react';

export const getFileType = (fileName: string): string => {
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
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
    return 'compressed';
  }

  return 'other';
};

export const getFileTypeIcon = (fileName: string): React.ReactNode => {
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

  return <HardDrive className='h-4 w-4' />;
};

export const createFileFilters = (
  file: FileInfo,
): { type: string; label: string; icon: React.ReactNode; color: string }[] => {
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
  } else if (fileType === 'compressed') {
    filters.push({
      type: 'compressed',
      label: 'Compressed',
      icon: <span className='text-xs leading-none'>📦</span>,
      color: 'border-red-500/30 bg-red-500/10 text-red-400',
    });
  } else {
    filters.push({
      type: 'other',
      label: 'Other',
      icon: <span className='text-xs leading-none'>📁</span>,
      color: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
    });
  }

  return filters;
};

export type FilterType = 'permanent' | 'temporary' | 'images' | 'videos' | 'documents' | 'compressed' | 'other';
export type FilterData = { type: string; label: string; icon: React.ReactNode; color: string };
