import { type FileInfo } from '@/lib/glovedapi';
import { FileIcon, FileText, HardDrive, ImageIcon, VideoIcon } from 'lucide-react';

export const FileTypes: Record<string, string[]> = {
  images: ['jpeg', 'jpg', 'gif', 'png', 'webp', 'svg', 'heif', 'heifs', 'heic', 'heics', 'avci', 'avcs', 'hif'],
  videos: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'],
  documents: ['pdf', 'doc', 'docx', 'txt', 'md', 'html'],
  compressed: ['zip', 'rar', '7z', 'tar', 'gz', 'mrpack'],
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
      type: Filters.temporary.value,
      label: Filters.temporary.label,
      icon: Filters.temporary.icon,
      color: Filters.temporary.color,
    });
  } else {
    filters.push({
      type: Filters.permanent.value,
      label: Filters.permanent.label,
      icon: Filters.permanent.icon,
      color: Filters.permanent.color,
    });
  }

  // File type filters
  const fileType = getFileType(file.name);
  if (fileType === 'images') {
    filters.push({
      type: Filters.images.value,
      label: Filters.images.label,
      icon: Filters.images.icon,
      color: Filters.images.color,
    });
  } else if (fileType === 'videos') {
    filters.push({
      type: Filters.videos.value,
      label: Filters.videos.label,
      icon: Filters.videos.icon,
      color: Filters.videos.color,
    });
  } else if (fileType === 'documents') {
    filters.push({
      type: Filters.documents.value,
      label: Filters.documents.label,
      icon: Filters.documents.icon,
      color: Filters.documents.color,
    });
  } else if (fileType === 'compressed') {
    filters.push({
      type: Filters.compressed.value,
      label: Filters.compressed.label,
      icon: Filters.compressed.icon,
      color: Filters.compressed.color,
    });
  } else {
    filters.push({
      type: Filters.other.value,
      label: Filters.other.label,
      icon: Filters.other.icon,
      color: Filters.other.color,
    });
  }

  return filters;
};

export const Filters = {
  permanent: {
    label: 'Permanent',
    value: 'permanent',
    icon: <span className='text-xs leading-none'>💾</span>,
    color: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  temporary: {
    label: 'Temporary',
    value: 'temporary',
    icon: <span className='text-xs leading-none'>⏰</span>,
    color: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  },
  images: {
    label: 'Images',
    value: 'images',
    icon: <span className='text-xs leading-none'>🖼️</span>,
    color: 'border-green-500/30 bg-green-500/10 text-green-400',
  },
  videos: {
    label: 'Videos',
    value: 'videos',
    icon: <span className='text-xs leading-none'>🎥</span>,
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
  },
  documents: {
    label: 'Documents',
    value: 'documents',
    icon: <span className='text-xs leading-none'>📄</span>,
    color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  },
  compressed: {
    label: 'Compressed',
    value: 'compressed',
    icon: <span className='text-xs leading-none'>📦</span>,
    color: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
  other: {
    label: 'Other',
    value: 'other',
    icon: <span className='text-xs leading-none'>📁</span>,
    color: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
  },
} as const;
export type FilterType = (typeof Filters)[keyof typeof Filters]['value'];
export type FilterData = { type: FilterType; label: string; icon: React.ReactNode; color: string };
