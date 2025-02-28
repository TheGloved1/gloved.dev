import * as React from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ModelDropdownProps {
  models: { [key: string]: string };
  selectedModel: string;
  onModelChange: (model: string) => void;
}

const ModelDropdown: React.FC<ModelDropdownProps> = ({ models, selectedModel, onModelChange }) => {
  return (
    <Select value={selectedModel} onValueChange={onModelChange}>
      <SelectTrigger className='max-w-[60vw]'>
        <SelectValue placeholder='Model' />
      </SelectTrigger>
      <SelectContent className='max-w-[60vw]'>
        {Object.entries(models).map(([label, value]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ModelDropdown;
