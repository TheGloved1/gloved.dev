import { GroceryItem } from '@/lib/redis';
import React from 'react';
import GroceryItemComponent from './grocery-item';

interface HaveListProps {
  items: GroceryItem[];
  onRemoveItem: (id: string) => void;
  onMoveItem: (id: string) => void;
  isRemoving?: boolean;
  isMoving?: boolean;
}

export default function HaveList({
  items,
  onRemoveItem,
  onMoveItem,
  isRemoving = false,
  isMoving = false,
}: HaveListProps): React.JSX.Element {
  if (items.length === 0) {
    return (
      <div className='py-16 text-center'>
        <p className='mb-2 text-lg font-medium text-red-600/50'>No items in Have list</p>
        <p className='text-sm text-red-600/30'>Items will appear here when moved from Shopping List</p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {items.map((item) => (
        <GroceryItemComponent
          key={item.id}
          item={item}
          onRemove={() => onRemoveItem(item.id)}
          onMove={() => onMoveItem(item.id)}
          moveButtonLabel='Move to Shopping'
          moveButtonClass='bg-green-600/80 hover:bg-green-500 border border-green-500/30 text-white'
          isRemoving={isRemoving}
          isMoving={isMoving}
        />
      ))}
    </div>
  );
}
