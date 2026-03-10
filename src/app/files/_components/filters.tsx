import { type FileInfo } from '@/lib/glovedapi';
import { Calendar, Clock, FileIcon, FileText, HardDrive, ImageIcon, VideoIcon } from 'lucide-react';

export const FileTypes: Record<string, string[]> = {
  images: ['jpeg', 'jpg', 'gif', 'png', 'webp', 'svg', 'heif', 'heifs', 'heic', 'heics', 'avci', 'avcs', 'hif'],
  videos: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'],
  documents: ['pdf', 'doc', 'docx', 'txt', 'md'],
  compressed: ['zip', 'rar', '7z', 'tar', 'gz'],
  other: [],
};

export const getFileType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (FileTypes.images.includes(extension || '')) {
    return 'images' as const;
  }
  if (FileTypes.videos.includes(extension || '')) {
    return 'videos' as const;
  }
  if (FileTypes.documents.includes(extension || '')) {
    return 'documents' as const;
  }
  if (FileTypes.compressed.includes(extension || '')) {
    return 'compressed' as const;
  }

  return 'other' as const;
};

export const getFileTypeIcon = (fileName: string): React.ReactNode => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (FileTypes.images.includes(extension || '')) {
    return <ImageIcon className='h-4 w-4' />;
  }
  if (FileTypes.videos.includes(extension || '')) {
    return <VideoIcon className='h-4 w-4' />;
  }
  if (FileTypes.documents.includes(extension || '')) {
    return <FileText className='h-4 w-4' />;
  }
  if (FileTypes.compressed.includes(extension || '')) {
    return <FileIcon className='h-4 w-4' />;
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
