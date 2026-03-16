import { GroceryItem } from '@/lib/redis';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
import React from 'react';

interface GroceryItemComponentProps {
  item: GroceryItem;
  onRemove: () => void;
  onMove: () => void;
  moveButtonLabel: string;
  moveButtonClass: string;
  isRemoving?: boolean;
  isMoving?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  showSelection?: boolean;
}

export default function GroceryItemComponent({
  item,
  onRemove,
  onMove,
  moveButtonLabel,
  moveButtonClass,
  isRemoving = false,
  isMoving = false,
  isSelected = false,
  onSelect,
  showSelection = false,
}: GroceryItemComponentProps): React.JSX.Element {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  return (
    <div
      className={`mb-3 rounded-xl border bg-black p-4 transition-all ${
        isSelected ? 'border-red-500 bg-red-500/5' : 'border-red-900/20'
      }`}
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-1 items-start gap-3'>
          {showSelection && onSelect && (
            <div className='pt-1'>
              <input
                type='checkbox'
                checked={isSelected}
                onChange={(e) => onSelect(e.target.checked)}
                className='h-4 w-4 rounded border-red-500/30 bg-red-900/20 text-red-500 focus:ring-red-500/50 focus:ring-offset-0'
              />
            </div>
          )}
          <div className='flex-1'>
            <p className='mb-2 text-base font-medium text-red-200 sm:text-lg'>{item.text}</p>
            <div className='flex flex-col gap-2 text-xs text-red-600/50 sm:flex-row sm:items-center'>
              <span>Added {formatDate(item.addedAt)}</span>
              <span className='hidden sm:inline'>•</span>
              <span>By {item.addedBy}</span>
            </div>
          </div>
        </div>

        <div className='flex gap-2'>
          <button
            onClick={onMove}
            disabled={isRemoving || isMoving}
            className='touch-manipulation-none flex min-h-[44px] items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50'
            title={moveButtonLabel}
          >
            {isMoving ?
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
            : <>
                {moveButtonLabel.includes('Needed') ?
                  <>
                    <ArrowDown className='h-4 w-4' />
                    <span className='hidden sm:inline'>Move to Have</span>
                    <span className='sm:hidden'>Have</span>
                  </>
                : <>
                    <ArrowUp className='h-4 w-4' />
                    <span className='hidden sm:inline'>Move to Shopping</span>
                    <span className='sm:hidden'>Shopping</span>
                  </>
                }
              </>
            }
          </button>
          <button
            onClick={onRemove}
            disabled={isRemoving || isMoving}
            className='touch-manipulation-none flex min-h-[44px] items-center gap-2 rounded-lg bg-red-900 px-4 py-2 font-medium text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50'
            title='Remove item'
          >
            {isRemoving ?
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
            : <>
                <Trash2 className='h-4 w-4' />
                <span className='hidden sm:inline'>Remove</span>
                <span className='sm:hidden'>Delete</span>
              </>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
