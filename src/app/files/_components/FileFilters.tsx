'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type FileInfo } from '@/lib/glovedapi';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Filter, Search, X } from 'lucide-react';
import { useCallback, useState } from 'react';

interface FileFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (filters: string[]) => void;
  files: FileInfo[];
  className?: string;
}

type FilterType = 'permanent' | 'temporary' | 'images' | 'videos' | 'documents';

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
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions: { type: FilterType; label: string; icon: React.ReactNode; count: number }[] = [
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
      // Toggle filter: if clicking same Filter, turn off; otherwise turn on
      const newFilters =
        activeFilters.includes(filterType) ? activeFilters.filter((f) => f !== filterType) : [...activeFilters, filterType];

      setActiveFilters(newFilters);
      onFilterChange(newFilters);
    },
    [onFilterChange, activeFilters],
  );

  const clearSearch = useCallback(() => {
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar with Filter Toggle */}
      <div className='relative flex gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50' />
          <Input
            type='text'
            placeholder='Search files...'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className='font-mono-industrial brutal-shadow-sm border border-white/10 bg-white/5 pl-10 pr-20 text-white placeholder:text-white/30 focus:border-fuchsia-500 focus:bg-fuchsia-500/5 focus-visible:ring-fuchsia-500/20'
          />
          {searchQuery && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onSearchChange('')}
              className='brutal-shadow-sm absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 border border-white/10 bg-white/5 p-0 text-white/50 hover:border-red-500 hover:bg-red-500/10 hover:text-red-400'
            >
              <X className='h-3 w-3' />
            </Button>
          )}
        </div>

        {/* Filter Toggle - Desktop */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => setShowFilters(!showFilters)}
          className='brutal-shadow-sm hidden border border-white/10 bg-white/5 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400 lg:flex'
        >
          <Filter className='h-4 w-4' />
          <span className='ml-2 hidden sm:inline'>Filters</span>
          {showFilters && (
            <span className='ml-2 flex h-5 w-5 items-center justify-center rounded-full border-fuchsia-500/50 bg-fuchsia-500/10 text-xs font-semibold text-fuchsia-400'>
              {activeFilters.length}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Toggle - Mobile */}
      <div className='lg:hidden'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setShowFilters(!showFilters)}
          className='brutal-shadow-sm flex items-center gap-2 border border-white/10 bg-white/5 text-white hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400 sm:w-auto'
        >
          <Filter className='h-4 w-4' />
          <span className='sm:hidden'>Filters</span>
          <span className='hidden sm:inline'>Filter Options</span>
          {showFilters && (
            <span className='flex h-5 w-5 items-center justify-center rounded-full border-fuchsia-500/50 bg-fuchsia-500/10 text-xs font-semibold text-fuchsia-400'>
              {activeFilters.length}
            </span>
          )}
        </Button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className='space-y-3 border border-fuchsia-500/30 bg-fuchsia-500/5 p-4'>
          <h4 className='font-display text-sm font-semibold uppercase tracking-wide text-white'>Filter by type</h4>
          <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6'>
            {filterOptions.map((option) => (
              <div key={option.type}>
                <Button
                  variant={activeFilters.includes(option.type) ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handleFilterChange(option.type)}
                  className={cn(
                    'font-mono-industrial flex items-center justify-start gap-2 text-xs',
                    activeFilters.includes(option.type) ?
                      'brutal-shadow-sm border-fuchsia-500 bg-fuchsia-500 text-white'
                    : 'border-fuchsia-500/50 bg-fuchsia-500/10 text-white/70 hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-white',
                  )}
                  disabled={option.count === 0}
                >
                  <span className='flex items-center gap-1'>
                    {option.icon}
                    <span>{option.label}</span>
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center justify-center rounded px-2 py-1 text-xs font-medium',
                      activeFilters.includes(option.type) ?
                        'border border-fuchsia-500/50 bg-fuchsia-500/20 text-white'
                      : 'border border-fuchsia-500/30 bg-fuchsia-500/10 text-white/50',
                    )}
                  >
                    {option.count}
                  </span>
                </Button>
              </div>
            ))}
          </div>

          {/* Clear Filters */}
          {activeFilters.length > 0 && (
            <div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setActiveFilters([])}
                className='brutal-shadow-sm w-full border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400 hover:border-fuchsia-500 hover:bg-fuchsia-500/10'
              >
                <X className='mr-2 h-4 w-4' />
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {(activeFilters.length > 0 || searchQuery) && (
        <div className='flex flex-wrap gap-2'>
          {activeFilters.map((filter) => (
            <span
              key={filter}
              className='font-mono-industrial inline-flex items-center gap-1 border border-fuchsia-500/50 bg-fuchsia-500/10 px-2 py-1 text-xs font-medium text-fuchsia-400'
            >
              {filterOptions.find((f) => f.type === filter)?.icon}
              {filterOptions.find((f) => f.type === filter)?.label}
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleFilterChange(filter)}
                className='brutal-shadow-sm ml-1 h-4 w-4 border border-fuchsia-500/30 bg-fuchsia-500/10 p-0 text-fuchsia-400 hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-white'
              >
                <X className='h-3 w-3' />
              </Button>
            </span>
          ))}
          {searchQuery && (
            <span className='font-mono-industrial inline-flex items-center gap-1 border border-fuchsia-500/50 bg-fuchsia-500/10 px-2 py-1 text-xs font-medium text-fuchsia-400'>
              &quot;{searchQuery}&quot;
              <Button
                variant='ghost'
                size='sm'
                onClick={clearSearch}
                className='brutal-shadow-sm ml-1 h-4 w-4 border border-fuchsia-500/30 bg-fuchsia-500/10 p-0 text-fuchsia-400 hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-white'
              >
                <X className='h-3 w-3' />
              </Button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
