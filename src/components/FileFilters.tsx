'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type FileInfo } from '@/lib/glovedapi';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Filter, HardDrive, Search, X } from 'lucide-react';
import { useCallback, useState } from 'react';

interface FileFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: FilterType) => void;
  files: FileInfo[];
  className?: string;
}

type FilterType = 'all' | 'permanent' | 'temporary' | 'images' | 'videos' | 'documents';

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

export default function FileFilters({
  searchQuery,
  onSearchChange,
  onFilterChange,
  files,
  className,
}: FileFiltersProps): React.JSX.Element {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions: { type: FilterType; label: string; icon: React.ReactNode; count: number }[] = [
    {
      type: 'all',
      label: 'All Files',
      icon: <HardDrive className='h-4 w-4' />,
      count: files.length,
    },
    {
      type: 'permanent',
      label: 'Permanent',
      icon: <Calendar className='h-4 w-4' />,
      count: files.filter((f) => !f.isTemp).length,
    },
    {
      type: 'temporary',
      label: 'Temporary',
      icon: <Clock className='h-4 w-4' />,
      count: files.filter((f) => f.isTemp).length,
    },
    {
      type: 'images',
      label: 'Images',
      icon: '🖼️',
      count: files.filter((f) => getFileType(f.name) === 'images').length,
    },
    {
      type: 'videos',
      label: 'Videos',
      icon: '🎥',
      count: files.filter((f) => getFileType(f.name) === 'videos').length,
    },
    {
      type: 'documents',
      label: 'Documents',
      icon: '📄',
      count: files.filter((f) => getFileType(f.name) === 'documents').length,
    },
  ];

  const handleFilterChange = useCallback(
    (filterType: FilterType) => {
      setActiveFilter(filterType);
      onFilterChange(filterType);
    },
    [onFilterChange],
  );

  const clearSearch = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  const getFilteredFiles = useCallback(() => {
    let filtered = files;

    // Apply type filter
    switch (activeFilter) {
      case 'permanent':
        filtered = filtered.filter((f) => !f.isTemp);
        break;
      case 'temporary':
        filtered = filtered.filter((f) => f.isTemp);
        break;
      case 'images':
        filtered = filtered.filter((f) => getFileType(f.name) === 'images');
        break;
      case 'videos':
        filtered = filtered.filter((f) => getFileType(f.name) === 'videos');
        break;
      case 'documents':
        filtered = filtered.filter((f) => getFileType(f.name) === 'documents');
        break;
      default:
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return filtered;
  }, [files, activeFilter, searchQuery]);

  const filteredCount = getFilteredFiles().length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='text'
          placeholder='Search files...'
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-10 pr-10'
          aria-label='Search files'
        />
        {searchQuery && (
          <Button
            variant='ghost'
            size='sm'
            onClick={clearSearch}
            className='absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0'
            aria-label='Clear search'
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className='flex items-center justify-between'>
        <Button variant='outline' size='sm' onClick={() => setShowFilters(!showFilters)} className='flex items-center gap-2'>
          <Filter className='h-4 w-4' />
          Filters
          {activeFilter !== 'all' && (
            <span className='ml-1 inline-flex h-5 items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground'>
              {filterOptions.find((f) => f.type === activeFilter)?.label}
            </span>
          )}
        </Button>

        <div className='text-sm text-muted-foreground'>
          {filteredCount} of {files.length} files
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className='space-y-3 rounded-lg border p-4'>
          <h4 className='text-sm font-medium'>Filter by type</h4>
          <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6'>
            {filterOptions.map((option) => (
              <Button
                key={option.type}
                variant={activeFilter === option.type ? 'default' : 'outline'}
                size='sm'
                onClick={() => handleFilterChange(option.type)}
                className='flex items-center justify-start gap-2'
                disabled={option.count === 0}
              >
                <span className='flex items-center gap-1'>
                  {option.icon}
                  <span className='text-xs'>{option.label}</span>
                </span>
                <span
                  className={cn(
                    'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
                    activeFilter === option.type ?
                      'bg-secondary text-secondary-foreground'
                    : 'border border-input bg-background text-foreground',
                  )}
                >
                  {option.count}
                </span>
              </Button>
            ))}
          </div>

          {/* Clear Filters */}
          {activeFilter !== 'all' && (
            <Button variant='ghost' size='sm' onClick={() => handleFilterChange('all')} className='w-full'>
              <X className='mr-2 h-4 w-4' />
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {(activeFilter !== 'all' || searchQuery) && (
        <div className='flex flex-wrap gap-2'>
          {activeFilter !== 'all' && (
            <span className='inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground'>
              {filterOptions.find((f) => f.type === activeFilter)?.icon}
              {filterOptions.find((f) => f.type === activeFilter)?.label}
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleFilterChange('all')}
                className='ml-1 h-4 w-4 p-0 hover:bg-transparent'
              >
                <X className='h-3 w-3' />
              </Button>
            </span>
          )}
          {searchQuery && (
            <span className='inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground'>
              Search: &quot;{searchQuery}&quot;
              <Button variant='ghost' size='sm' onClick={clearSearch} className='ml-1 h-4 w-4 p-0 hover:bg-transparent'>
                <X className='h-3 w-3' />
              </Button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
