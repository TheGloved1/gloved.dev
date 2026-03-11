import { type FileInfo } from '@/lib/glovedapi';

// Helper function to safely check if extension matches file types
const hasExtension = (fileTypes: readonly string[], extension: string | undefined): extension is string => {
  return !!extension && fileTypes.includes(extension as any);
};

export const getFileType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (!extension) return 'other';

  // Find which filter type matches this extension
  for (const [_, filter] of Object.entries(Filters)) {
    if (filter.type === 'file' && hasExtension(filter.fileTypes, extension)) {
      return filter.value;
    }
  }

  return 'other';
};

export const getFileTypeIcon = (fileName: string): React.ReactNode => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  // Find which filter type matches this extension
  for (const [_, filter] of Object.entries(Filters)) {
    if (filter.type === 'file' && hasExtension(filter.fileTypes, extension)) {
      return filter.icon;
    }
  }

  return Filters.other.icon;
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
    type: 'upload',
    getCount: (files: FileInfo[]) => files.filter((f) => !f.isTemp).length,
  },
  temporary: {
    label: 'Temporary',
    value: 'temporary',
    icon: <span className='text-xs leading-none'>⏰</span>,
    color: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
    type: 'upload',
    getCount: (files: FileInfo[]) => files.filter((f) => f.isTemp).length,
  },
  images: {
    label: 'Images',
    value: 'images',
    icon: <span className='text-xs leading-none'>🖼️</span>,
    color: 'border-green-500/30 bg-green-500/10 text-green-400',
    fileTypes: ['jpeg', 'jpg', 'gif', 'png', 'webp', 'svg', 'heif', 'heifs', 'heic', 'heics', 'avci', 'avcs', 'hif'],
    type: 'file',
    getCount: (files: FileInfo[]) => files.filter((f) => getFileType(f.name) === 'images').length,
  },
  videos: {
    label: 'Videos',
    value: 'videos',
    icon: <span className='text-xs leading-none'>🎥</span>,
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    fileTypes: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
    type: 'file',
    getCount: (files: FileInfo[]) => files.filter((f) => getFileType(f.name) === 'videos').length,
  },
  audio: {
    label: 'Audio',
    value: 'audio',
    icon: <span className='text-xs leading-none'>🎵</span>,
    color: 'border-pink-500/30 bg-pink-500/10 text-pink-400',
    fileTypes: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'],
    type: 'file',
    getCount: (files: FileInfo[]) => files.filter((f) => getFileType(f.name) === 'audio').length,
  },
  documents: {
    label: 'Documents',
    value: 'documents',
    icon: <span className='text-xs leading-none'>📄</span>,
    color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    fileTypes: ['pdf', 'doc', 'docx', 'txt', 'md', 'html'],
    type: 'file',
    getCount: (files: FileInfo[]) => files.filter((f) => getFileType(f.name) === 'documents').length,
  },
  compressed: {
    label: 'Compressed',
    value: 'compressed',
    icon: <span className='text-xs leading-none'>📦</span>,
    color: 'border-red-500/30 bg-red-500/10 text-red-400',
    fileTypes: ['zip', 'rar', '7z', 'tar', 'gz', 'mrpack'],
    type: 'file',
    getCount: (files: FileInfo[]) => files.filter((f) => getFileType(f.name) === 'compressed').length,
  },
  other: {
    label: 'Other',
    value: 'other',
    icon: <span className='text-xs leading-none'>📁</span>,
    color: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
    fileTypes: [],
    type: 'file',
    getCount: (files: FileInfo[]) => files.filter((f) => getFileType(f.name) === 'other').length,
  },
} as const;
export type Filter = (typeof Filters)[keyof typeof Filters];
export type FilterValue = Filter['value'];
export const FilterValues = Object.values(Filters).map((filter) => filter.value);
export type FilterData = { type: Filter['type']; label: string; icon: React.ReactNode; color: string };
