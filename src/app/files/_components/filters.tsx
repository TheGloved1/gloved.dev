import { type FileInfo } from '@/lib/glovedapi';

export const getFileType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (!extension) return 'other' as const;

  if (Filters.images.fileTypes.includes(extension as any)) {
    return 'images' as const;
  } else if (Filters.videos.fileTypes.includes(extension as any)) {
    return 'videos' as const;
  } else if (Filters.audio.fileTypes.includes(extension as any)) {
    return 'audio' as const;
  } else if (Filters.documents.fileTypes.includes(extension as any)) {
    return 'documents' as const;
  } else if (Filters.compressed.fileTypes.includes(extension as any)) {
    return 'compressed' as const;
  } else return 'other' as const;
};

export const getFileTypeIcon = (fileName: string): React.ReactNode => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (Filters.images.fileTypes.includes(extension as any)) {
    return Filters.images.icon;
  } else if (Filters.videos.fileTypes.includes(extension as any)) {
    return Filters.videos.icon;
  } else if (Filters.audio.fileTypes.includes(extension as any)) {
    return Filters.audio.icon;
  } else if (Filters.documents.fileTypes.includes(extension as any)) {
    return Filters.documents.icon;
  } else if (Filters.compressed.fileTypes.includes(extension as any)) {
    return Filters.compressed.icon;
  } else return Filters.other.icon;
};

/**
 * Creates an array of file filters based on the given FileInfo.
 * The filters include Temporary/Permanent and File Type filters.
 * @param file The FileInfo object to create filters for.
 * @returns An array of file filters with type, label, icon, and color properties.
 */
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
  const fileFilter = Filters[fileType];
  if (fileFilter) {
    filters.push({
      type: fileFilter.value,
      label: fileFilter.label,
      icon: fileFilter.icon,
      color: fileFilter.color,
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
    fileTypes: ['jpeg', 'jpg', 'gif', 'png', 'webp', 'svg', 'heif', 'heifs', 'heic', 'heics', 'avci', 'avcs', 'hif'],
  },
  videos: {
    label: 'Videos',
    value: 'videos',
    icon: <span className='text-xs leading-none'>🎥</span>,
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    fileTypes: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
  },
  audio: {
    label: 'Audio',
    value: 'audio',
    icon: <span className='text-xs leading-none'>🎵</span>,
    color: 'border-pink-500/30 bg-pink-500/10 text-pink-400',
    fileTypes: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
  },
  documents: {
    label: 'Documents',
    value: 'documents',
    icon: <span className='text-xs leading-none'>📄</span>,
    color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    fileTypes: ['pdf', 'doc', 'docx', 'txt', 'md', 'html'],
  },
  compressed: {
    label: 'Compressed',
    value: 'compressed',
    icon: <span className='text-xs leading-none'>📦</span>,
    color: 'border-red-500/30 bg-red-500/10 text-red-400',
    fileTypes: ['zip', 'rar', '7z', 'tar', 'gz', 'mrpack'],
  },
  other: {
    label: 'Other',
    value: 'other',
    icon: <span className='text-xs leading-none'>📁</span>,
    color: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
    fileTypes: [],
  },
} as const;
export type FilterType = (typeof Filters)[keyof typeof Filters]['value'];
export type FilterData = { type: FilterType; label: string; icon: React.ReactNode; color: string };
