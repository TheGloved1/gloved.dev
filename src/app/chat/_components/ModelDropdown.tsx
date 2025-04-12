'use client';
import { Tooltip } from '@/components/TooltipSystem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { defaultModel, ModelID, Models } from '@/lib/ai';
import { Info } from 'lucide-react';

export default function ModelDropdown() {
  const [model, setModel] = useLocalStorage<ModelID>('model', defaultModel);
  return (
    <Select value={model} onValueChange={setModel as (value: string) => void}>
      <SelectTrigger className='max-w-[60vw]' defaultValue={model}>
        <SelectValue placeholder={'Select a model'} />
      </SelectTrigger>
      <SelectContent className='max-w-[60vw]'>
        {Models.map(({ label, value, enabled, description }) => {
          if (!enabled) return null;
          return (
            <SelectItem key={value} value={value} disabled={!enabled} className='group/select' textValue={label}>
              <span className='flex items-center gap-2'>
                {label}
                <Tooltip content={description} size='sm' unselectable='on' radius={'lg'} maxWidth={'30rem'} asChild>
                  <Info className='size-5 rounded-full opacity-0 hover:bg-gray-500/50 group-hover/select:!opacity-100' />
                </Tooltip>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
