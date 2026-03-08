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
          <span className='hidden sm:inline'>Filters</span>
        </Button>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className='relative'>
          {/* Backdrop */}
          <div className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden' onClick={() => setShowFilters(false)} />

          {/* Filter Panel */}
          <div className='absolute right-0 top-0 z-50 w-80 border border-fuchsia-500/20 bg-black/90 shadow-2xl backdrop-blur-md lg:relative lg:right-auto lg:top-auto lg:w-full lg:border lg:bg-fuchsia-500/5 lg:shadow-none lg:backdrop-blur-none'>
            <div className='space-y-6 p-6'>
              {/* Header */}
              <div className='flex items-center justify-between'>
                <h3 className='font-display text-lg font-semibold uppercase tracking-wide text-white'>Filters</h3>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowFilters(false)}
                  className='h-8 w-8 border border-white/10 bg-white/5 p-0 text-white/70 hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400 lg:hidden'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>

              {/* Filter Grid */}
              <div className='space-y-4'>
                <h4 className='font-mono-industrial text-xs font-medium uppercase tracking-wider text-white/60'>
                  File Type
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {filterOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => handleFilterChange(option.type)}
                      disabled={option.count === 0}
                      className={cn(
                        'group relative flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-all duration-200',
                        activeFilters.includes(option.type) ?
                          'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400 shadow-md shadow-fuchsia-500/20'
                        : 'border-white/10 bg-white/5 text-white/70 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 hover:text-white',
                        option.count === 0 && 'cursor-not-allowed opacity-40',
                      )}
                    >
                      <div className='text-sm'>{option.icon}</div>
                      <div className='font-mono-industrial text-xs font-medium'>{option.label}</div>
                      <div
                        className={cn(
                          'rounded px-1.5 py-0.5 text-xs font-semibold',
                          activeFilters.includes(option.type) ?
                            'bg-fuchsia-500/20 text-fuchsia-300'
                          : 'bg-white/10 text-white/60',
                        )}
                      >
                        {option.count}
                      </div>

                      {/* Active indicator */}
                      {activeFilters.includes(option.type) && (
                        <div className='absolute -right-1 -top-1 h-2 w-2 rounded-full bg-fuchsia-500 shadow-md shadow-fuchsia-500/40' />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className='flex flex-col gap-3 border-t border-white/10 pt-4'>
                {activeFilters.length > 0 && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setActiveFilters([])}
                    className='w-full border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400 hover:border-fuchsia-500 hover:bg-fuchsia-500/20 hover:text-fuchsia-300'
                  >
                    <X className='mr-2 h-4 w-4' />
                    Clear {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {(activeFilters.length > 0 || searchQuery) && (
        <div className='flex flex-wrap gap-2'>
          {activeFilters.map((filter) => (
            <div key={filter}>
              {/* Mobile: Clickable whole pill */}
              <button
                onClick={() => handleFilterChange(filter)}
                className='font-mono-industrial inline-flex items-center gap-1 border border-fuchsia-500/50 bg-fuchsia-500/10 px-2 py-1 text-xs font-medium text-fuchsia-400 transition-colors duration-200 hover:border-fuchsia-500 hover:bg-fuchsia-500/20 lg:hidden'
              >
                {filterOptions.find((f) => f.type === filter)?.icon}
                {filterOptions.find((f) => f.type === filter)?.label}
              </button>

              {/* Desktop: Pill with X button */}
              <span className='font-mono-industrial hidden items-center gap-1 border border-fuchsia-500/50 bg-fuchsia-500/10 px-2 py-1 text-xs font-medium text-fuchsia-400 lg:inline-flex'>
                {filterOptions.find((f) => f.type === filter)?.icon}
                {filterOptions.find((f) => f.type === filter)?.label}
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleFilterChange(filter)}
                  className='ml-1 h-4 w-4 border border-fuchsia-500/30 bg-fuchsia-500/10 p-0 text-fuchsia-400 hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-white'
                >
                  <X className='h-3 w-3' />
                </Button>
              </span>
            </div>
          ))}
          {searchQuery && (
            <span className='font-mono-industrial inline-flex items-center gap-1 border border-fuchsia-500/50 bg-fuchsia-500/10 px-2 py-1 text-xs font-medium text-fuchsia-400'>
              &quot;{searchQuery}&quot;
              <Button
                variant='ghost'
                size='sm'
                onClick={clearSearch}
                className='ml-1 h-4 w-4 border border-fuchsia-500/30 bg-fuchsia-500/10 p-0 text-fuchsia-400 hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-white'
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
