'use client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useChat } from '@/hooks/use-chat';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useIsMobile } from '@/hooks/use-mobile';
import { CustomTool, Models, TOOL_CONFIG } from '@/lib/ai';
import { ChevronDown, ChevronUp, Wrench } from 'lucide-react';
import { useState } from 'react';

/**
 * A component to display tool dropdown for currently selected model.
 * The component will display a dropdown with toggleable tool options.
 * Only tools that are enabled in settings and supported by the current model will be shown.
 */
export default function ToolDropdown() {
  const { model, tools, setTools } = useChat();
  const [enabledTools] = useLocalStorage<CustomTool[]>('enabledTools', []);
  const [isOpen, setIsOpen] = useState(false);
  const selectedModel = Models.find((m) => m.value === model) as (typeof Models)[number];
  const isMobile = useIsMobile();

  const handleToolToggle = (tool: CustomTool, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent dropdown from closing
    setTools((prev) => {
      if (prev?.includes(tool)) {
        return prev.filter((t) => t !== tool);
      } else {
        return [...(prev ?? []), tool];
      }
    });
    // Don't close dropdown when toggling tools
  };

  // Handle mobile tool toggle with tooltip
  const handleMobileToolToggle = (tool: CustomTool, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTools((prev) => {
      if (prev?.includes(tool)) {
        return prev.filter((t) => t !== tool);
      } else {
        return [...(prev ?? []), tool];
      }
    });
  };

  // Filter tools that are enabled in settings AND supported by current model
  const availableTools = Object.values(TOOL_CONFIG).filter((toolConfig) => {
    const tool = toolConfig.value;
    const isToolEnabled = enabledTools.includes(tool);
    const isModelSupported = selectedModel.tools.includes(tool);
    return isToolEnabled && isModelSupported;
  });

  const activeToolsCount = tools?.filter((tool) => availableTools.some((t) => t.value === tool))?.length || 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          type='button'
          className='-mb-1.5 inline-flex h-auto items-center justify-center gap-2 whitespace-nowrap rounded-full border border-solid border-secondary-foreground/10 px-3 py-1.5 pl-2 pr-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-foreground/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
        >
          <Wrench className='size-4' />
          {isMobile ?
            activeToolsCount > 0 ?
              activeToolsCount
            : ''
          : activeToolsCount > 0 ?
            `${activeToolsCount} Tool${activeToolsCount === 1 ? '' : 's'}`
          : 'No Tools'}
          {isOpen ?
            <ChevronUp className='size-4' />
          : <ChevronDown className='size-4' />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-3' align={isMobile ? 'end' : 'start'}>
        <div className='space-y-2'>
          <h1 className='text-sm font-medium md:text-base'>Tools</h1>
          {!isMobile && <p className='text-xs text-muted-foreground'>Tools give the AI access to external capabilities.</p>}
          {availableTools.length === 0 ?
            <div className='px-2 py-4 text-center text-sm text-muted-foreground'>No tools available for this model.</div>
          : availableTools.map((toolConfig) => {
              const tool = toolConfig.value;
              const isActive = tools?.includes(tool);

              return (
                <div
                  key={tool}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    isActive ? 'border-primary/20 bg-primary/5' : 'border-border hover:border-border/60 hover:bg-muted/30'
                  }`}
                  onClick={isMobile ? (e) => handleMobileToolToggle(tool, e) : (e) => handleToolToggle(tool, e)}
                >
                  <div className='flex items-start gap-3'>
                    {/* Tool Icon */}
                    <div className='mt-0.5 flex-shrink-0'>{toolConfig.icon}</div>

                    {/* Tool Content */}
                    <div className='min-w-0 flex-1'>
                      <div className='mb-1 flex items-center gap-2'>
                        <h4 className='text-sm font-medium text-foreground'>{toolConfig.name}</h4>
                        {isActive && <div className='h-2 w-2 flex-shrink-0 rounded-full bg-green-500' />}
                      </div>
                      <p className='text-xs leading-relaxed text-muted-foreground'>{toolConfig.description}</p>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </PopoverContent>
    </Popover>
  );
}
