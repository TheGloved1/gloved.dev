'use client';
import { useLocalStorage } from '@/hooks/use-local-storage';

import { type Theme, themes } from '@/components/ThemeChanger';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAdmin } from '@/hooks/use-admin';
import { useChatOptions } from '@/hooks/use-chat-options';
import { useDebounce } from '@/hooks/use-debounce';
import { Model, Models } from '@/lib/ai';
import { fuzzySearch } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { Bot, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useLayoutEffect, useMemo, useState } from 'react';
import { DeepSeekIcon, GeminiIcon, GPTIcon, LlamaIcon } from './ModelIcons';

export default function ModelDropdown() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model>(Models[0]);
  const { model, setModel } = useChatOptions();
  const [theme] = useLocalStorage<Theme>('theme', themes.dark);
  const debouncedSearchQuery = useDebounce(searchQuery, 150);
  const admins = useAdmin();
  const { isSignedIn } = useUser();

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedModel(Models.find((m) => m.value === model) || Models[0]);
  }, [model]);

  // Filter models based on search query
  const filteredModels = useMemo(() => {
    const availableModels = Models.filter((m) => {
      if (!m.enabled) return false;
      if (m.requirements.admin && !admins.isAdmin) return false;
      return true;
    });

    if (!debouncedSearchQuery.trim()) return availableModels;

    return fuzzySearch(availableModels, debouncedSearchQuery, ['label', 'value', 'provider']);
  }, [admins.isAdmin, debouncedSearchQuery]);

  // Function to get the appropriate icon based on model name
  const getModelIcon = (model: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const className =
      size === 'sm' ? 'size-5'
      : size === 'lg' ? 'size-7'
      : 'size-6';

    if (model.toLowerCase().includes('gemini')) {
      return <GeminiIcon className={className} />;
    } else if (model.toLowerCase().includes('deepseek')) {
      return <DeepSeekIcon className={className} />;
    } else if (model.toLowerCase().includes('gpt')) {
      return <GPTIcon className={className} />;
    } else if (model.toLowerCase().includes('llama')) {
      return <LlamaIcon className={className} />;
    }

    // Default icon
    return <Bot className={className} />;
  };

  return (
    <div className={`${theme.className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            className='-mb-2 inline-flex h-auto items-center justify-center gap-2 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-foreground/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
          >
            <span suppressHydrationWarning>{selectedModel.label || 'No model selected'}</span>
            {isOpen ?
              <ChevronUp className='size-4 opacity-50' />
            : <ChevronDown className='size-4 opacity-50' />}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          className='!outline-chat-border/20 transform-origin ease-snappy relative z-50 max-h-[calc(100vh-80px)] min-h-[300px] min-w-[8rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg !border-none bg-popover p-0 pb-11 pt-10 text-popover-foreground shadow-md !outline !outline-1 !outline-white/5 transition-[height,width] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 max-sm:mx-4 sm:w-[640px] sm:rounded-lg'
        >
          <div className='fixed inset-x-4 top-0 rounded-t-lg bg-popover px-3.5 pt-0.5 sm:inset-x-0'>
            <div className='flex items-center'>
              <Search className='ml-px mr-3 !size-4 text-muted-foreground/75' />
              <input
                placeholder='Search models...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full bg-transparent py-2 text-sm text-foreground placeholder-muted-foreground/50 placeholder:select-none focus:outline-none'
              />
            </div>
          </div>
          <div className='border-chat-border border-b px-3'></div>

          {filteredModels.length === 0 ?
            <div className='flex flex-col items-center justify-center p-8 text-center text-gray-400'>
              <Search className='mb-3 h-12 w-12 text-gray-700' />
              <h3 className='mb-1 text-lg font-medium text-gray-300'>No models found</h3>
              <p className='max-w-[250px] text-sm'>No models found that match your search criteria.</p>
            </div>
          : <div className='flex w-full flex-wrap justify-start gap-3.5 pb-4 pl-3 pr-2 pt-2.5'>
              {filteredModels.map((modelItem) => (
                <div className='group relative' key={modelItem.value}>
                  <div className='absolute -left-1.5 -top-1.5 z-10 rounded-full bg-popover p-0.5'></div>
                  <Tooltip delayDuration={600} disableHoverableContent>
                    <TooltipTrigger asChild>
                      <button
                        disabled={modelItem.requirements?.loggedIn && !isSignedIn}
                        onClick={() => {
                          if (modelItem.requirements?.loggedIn && !isSignedIn) return;
                          setModel(modelItem.value);
                          setIsOpen(false);
                        }}
                        className={`border-chat-border/50 text-color-heading hover:text-color-heading border-chat-border group relative flex h-[148px] w-[108px] cursor-pointer flex-col items-start gap-0.5 overflow-hidden rounded-xl border bg-[hsl(320,20%,2.9%)] bg-sidebar/20 px-1 py-3 [--model-muted:hsl(var(--muted-foreground)/0.9)] [--model-primary:hsl(var(--color-heading))] hover:bg-accent/30 ${
                          model === modelItem.value ?
                            'border-amber-500/40 shadow-[inset_0_0_15px_rgba(245,158,11,0.15)] ring-2 ring-amber-500/30'
                          : ''
                        } ${modelItem.requirements?.loggedIn && !isSignedIn ? 'opacity-50 grayscale filter' : ''}`}
                      >
                        <div className='flex w-full flex-col items-center justify-center gap-1 font-medium transition-colors'>
                          {getModelIcon(modelItem.label, 'lg')}
                          <div className='w-full text-center'>
                            <div className='text-base font-semibold'>{modelItem.label.split(' ')[0]}</div>
                            <div className='-mt-0.5 text-sm font-semibold'>
                              {modelItem.label
                                .replace(/\s*\([^)]*\)/g, '')
                                .split(' ')
                                .slice(1)
                                .join(' ')}
                            </div>
                            <div className='-mt-0.5 text-[10px] text-primary/75'>
                              {(modelItem.label.match(/\([^)]*\)/g) || []).join(' ')}
                            </div>
                          </div>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className='w-48'>
                      {modelItem.requirements?.loggedIn && !isSignedIn ?
                        'You must be signed in to use this model'
                      : modelItem.description}
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          }
        </PopoverContent>
      </Popover>
    </div>
  );
}
