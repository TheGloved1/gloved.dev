import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, CheckSquare, Square, Trash2, X } from 'lucide-react';
import React from 'react';

interface BulkActionsToolbarProps {
  selectionMode: boolean;
  selectedCount: number;
  onToggleSelectionMode: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkMove: () => void;
  onBulkRemove: () => void;
  isBulkMoving?: boolean;
  isBulkRemoving?: boolean;
  moveButtonLabel: string;
}

export default function BulkActionsToolbar({
  selectionMode,
  selectedCount,
  onToggleSelectionMode,
  onSelectAll,
  onClearSelection,
  onBulkMove,
  onBulkRemove,
  isBulkMoving = false,
  isBulkRemoving = false,
  moveButtonLabel,
}: BulkActionsToolbarProps): React.JSX.Element {
  if (!selectionMode) {
    return (
      <div className='mb-4 flex items-center justify-between'>
        <Button
          onClick={onToggleSelectionMode}
          variant='outline'
          size='sm'
          className='rounded-lg border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10'
        >
          <CheckSquare className='mr-2 h-4 w-4' />
          Select Items
        </Button>
      </div>
    );
  }

  return (
    <div className='mb-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            onClick={onToggleSelectionMode}
            variant='ghost'
            size='sm'
            className='rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10'
          >
            <X className='mr-2 h-4 w-4' />
            Cancel
          </Button>
          <span className='text-sm font-medium text-red-300'>
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Button
            onClick={onSelectAll}
            variant='outline'
            size='sm'
            className='rounded-lg border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10'
          >
            <Square className='mr-2 h-4 w-4' />
            Select All
          </Button>
          
          <Button
            onClick={onClearSelection}
            variant='outline'
            size='sm'
            className='rounded-lg border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10'
            disabled={selectedCount === 0}
          >
            <X className='mr-2 h-4 w-4' />
            Clear
          </Button>

          <Button
            onClick={onBulkMove}
            variant='default'
            size='sm'
            className='rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50'
            disabled={selectedCount === 0 || isBulkMoving || isBulkRemoving}
          >
            {isBulkMoving ? (
              <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
            ) : moveButtonLabel.includes('Needed') ? (
              <ArrowDown className='mr-2 h-4 w-4' />
            ) : (
              <ArrowUp className='mr-2 h-4 w-4' />
            )}
            {moveButtonLabel}
          </Button>

          <Button
            onClick={onBulkRemove}
            variant='destructive'
            size='sm'
            className='rounded-lg bg-red-900 px-3 py-2 text-sm text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50'
            disabled={selectedCount === 0 || isBulkMoving || isBulkRemoving}
          >
            {isBulkRemoving ? (
              <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
            ) : (
              <Trash2 className='mr-2 h-4 w-4' />
            )}
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
