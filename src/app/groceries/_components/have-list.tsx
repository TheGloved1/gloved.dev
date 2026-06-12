import React from 'react';
import GroceryItemComponent from './grocery-item';

interface GroceryItemData {
  _id: string;
  text: string;
  addedAt: number;
  updatedAt?: number;
  addedBy: string;
}

interface HaveListProps {
  items: GroceryItemData[];
  onRemoveItem: (id: string) => void;
  onMoveItem: (id: string) => void;
  isRemoving?: boolean;
  isMoving?: boolean;
  selectionMode?: boolean;
  selectedItems?: Set<string>;
  onToggleSelection?: (itemId: string, selected: boolean) => void;
}

const HaveList = React.memo(function HaveList({
  items,
  onRemoveItem,
  onMoveItem,
  isRemoving = false,
  isMoving = false,
  selectionMode = false,
  selectedItems = new Set(),
  onToggleSelection,
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
          key={item._id}
          item={item}
          onRemove={() => onRemoveItem(item._id)}
          onMove={() => onMoveItem(item._id)}
          moveButtonLabel='Move to Shopping'
          moveButtonClass='bg-green-600/80 hover:bg-green-500 border border-green-500/30 text-white'
          isRemoving={isRemoving}
          isMoving={isMoving}
          isSelected={selectedItems.has(item._id)}
          onSelect={onToggleSelection ? (selected) => onToggleSelection(item._id, selected) : undefined}
          showSelection={selectionMode}
          hideIndividualActions={selectionMode}
        />
      ))}
    </div>
  );
});

export default HaveList;
