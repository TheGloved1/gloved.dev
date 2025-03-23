'use client';
import { Tooltip, TooltipProvider } from '@/components/TooltipSystem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Constants from '@/lib/constants';
import { Info } from 'lucide-react';

interface ModelDropdownProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelDropdown = ({ selectedModel, onModelChange }: ModelDropdownProps) => {
  return (
    <TooltipProvider>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className='max-w-[60vw]'>
          <SelectValue placeholder='Model' />
        </SelectTrigger>
        <SelectContent className='max-w-[60vw]'>
          {Constants.NewChatModels.map(({ label, value, enabled, description }) => (
            <>
              <SelectItem key={value} value={value} disabled={!enabled} className='group/select' textValue={label}>
                <span className='flex items-center gap-2'>
                  {label}
                  <Tooltip content={description} size='sm' unselectable='on' radius={'lg'} asChild>
                    <Info className='size-5 rounded-full opacity-0 hover:bg-gray-500/50 group-hover/select:!opacity-100' />
                  </Tooltip>
                </span>
              </SelectItem>
            </>
          ))}
        </SelectContent>
      </Select>
    </TooltipProvider>
  );
};

export default ModelDropdown;
