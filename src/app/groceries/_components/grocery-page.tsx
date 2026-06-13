'use client';
import { Button } from '@/components/ui/button';
import { useMount } from '@/hooks/use-mount';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { api } from '@convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { ShoppingCart } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import AddItemForm from './add-item-form';
import BulkActionsToolbar from './bulk-actions-toolbar';
import HaveList from './have-list';
import ShoppingList from './shopping-list';

export default function GroceryPage(): React.JSX.Element {
  const { user, isSignedIn } = useUser();
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [shoppingListSelectionMode, setShoppingListSelectionMode] = useState<boolean>(false);
  const [haveListSelectionMode, setHaveListSelectionMode] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const getUserName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.username) {
      return user.username;
    }
    if (user?.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress.split('@')[0];
    }
    return '';
  };

  const getOrCreateAnonymousId = (): string => {
    if (typeof window === 'undefined') return 'anonymous';
    try {
      let id = localStorage.getItem('grocery_anonymous_id');
      if (!id) {
        id = `anon_${crypto.randomUUID()}`;
        localStorage.setItem('grocery_anonymous_id', id);
      }
      return id;
    } catch {
      return 'anonymous';
    }
  };

  useMount(() => {
    if (!isSignedIn) {
      setAnonymousId(getOrCreateAnonymousId());
    }
  });

  const userName = getUserName();

  const shoppingList = useQuery(api.groceries.getShoppingList);
  const haveList = useQuery(api.groceries.getHaveList);
  const addItemMut = useMutation(api.groceries.addItem);
  const removeItemMut = useMutation(api.groceries.removeItem);
  const moveItemMut = useMutation(api.groceries.moveItem);
  const bulkRemoveMut = useMutation(api.groceries.bulkRemove);
  const bulkMoveMut = useMutation(api.groceries.bulkMove);

  const [addItemPending, setAddItemPending] = useState(false);
  const [removeItemPending, setRemoveItemPending] = useState(false);
  const [moveItemPending, setMoveItemPending] = useState(false);
  const [bulkRemovePending, setBulkRemovePending] = useState(false);
  const [bulkMovePending, setBulkMovePending] = useState(false);

  const handleAddItem = async (listKey: 'shopping-list' | 'have-list', text: string) => {
    setAddItemPending(true);
    try {
      const identifier = isSignedIn && userName ? userName : anonymousId || 'anonymous';
      await addItemMut({ listKey, text, addedBy: identifier });
      toast.success('Item added');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add item');
    }
    setAddItemPending(false);
  };

  const handleRemoveItem = async (itemId: string) => {
    setRemoveItemPending(true);
    try {
      await removeItemMut({ itemId: itemId as any });
      toast.success('Item removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove item');
    }
    setRemoveItemPending(false);
  };

  const handleMoveItem = async (itemId: string, fromList: 'shopping-list' | 'have-list') => {
    setMoveItemPending(true);
    try {
      const toList = fromList === 'shopping-list' ? 'have-list' : 'shopping-list';
      await moveItemMut({ fromListKey: fromList, toListKey: toList, itemId: itemId as any });
      toast.success('Item moved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to move item');
    }
    setMoveItemPending(false);
  };

  const handleBulkRemove = async () => {
    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length === 0) return;
    setBulkRemovePending(true);
    try {
      await bulkRemoveMut({ itemIds: selectedIds as any });
      toast.success('Items removed');
      setSelectedItems(new Set());
      setShoppingListSelectionMode(false);
      setHaveListSelectionMode(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove items');
    }
    setBulkRemovePending(false);
  };

  const handleBulkMove = async (fromList: 'shopping-list' | 'have-list') => {
    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length === 0) return;
    setBulkMovePending(true);
    try {
      const toList = fromList === 'shopping-list' ? 'have-list' : 'shopping-list';
      await bulkMoveMut({ fromListKey: fromList, toListKey: toList, itemIds: selectedIds as any });
      toast.success('Items moved');
      setSelectedItems(new Set());
      setShoppingListSelectionMode(false);
      setHaveListSelectionMode(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to move items');
    }
    setBulkMovePending(false);
  };

  const handleToggleSelection = (itemId: string, selected: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (listKey: 'shopping-list' | 'have-list', items: any[]) => {
    const itemIds = items.map((item) => item._id);
    setSelectedItems(new Set(itemIds));
  };

  const handleClearSelection = () => {
    setSelectedItems(new Set());
  };

  const toggleShoppingListSelectionMode = () => {
    setShoppingListSelectionMode(!shoppingListSelectionMode);
    setHaveListSelectionMode(false);
    setSelectedItems(new Set());
  };

  const toggleHaveListSelectionMode = () => {
    setHaveListSelectionMode(!haveListSelectionMode);
    setShoppingListSelectionMode(false);
    setSelectedItems(new Set());
  };

  if (shoppingList === undefined || haveList === undefined) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black'>
        <div className='px-4 text-center'>
          <div className='mb-6 h-12 w-12 animate-spin rounded-full border border-red-500/30 border-t-red-500'></div>
          <p className='text-base text-red-400'>Loading your shopping lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black'>
      <header className='border-b border-red-900/20'>
        <div className='mx-auto max-w-4xl px-4 py-6 sm:px-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10'>
                <ShoppingCart className='h-6 w-6 text-red-400' />
              </div>
              <div>
                <h1 className='text-2xl font-light text-red-400 sm:text-3xl'>Hood House Groceries</h1>
                <p className='text-sm text-red-600/70'>Synced shopping list</p>
              </div>
            </div>

            <div className='flex items-center gap-4'>
              {isSignedIn ?
                <UserButton />
              : <SignInButton mode='modal' forceRedirectUrl='/groceries'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='rounded-lg border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10'
                  >
                    Sign In
                  </Button>
                </SignInButton>
              }
            </div>
          </div>
        </div>
      </header>

      <main className='mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-12'>
        <AddItemForm listKey='shopping-list' onAddItem={handleAddItem} isLoading={addItemPending} />
        <div className='mt-6 space-y-12'>
          <section>
            <div className='mb-6 flex items-center gap-3'>
              <ShoppingCart className='h-6 w-6 text-red-500' />
              <h2 className='text-xl font-light text-red-300 sm:text-2xl'>Shopping List</h2>
              <span className='rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium text-red-300'>
                {shoppingList.length} items
              </span>
            </div>

            {shoppingList.length > 0 && (
              <BulkActionsToolbar
                selectionMode={shoppingListSelectionMode}
                selectedCount={Array.from(selectedItems).filter((id) => shoppingList.some((item) => item._id === id)).length}
                onToggleSelectionMode={toggleShoppingListSelectionMode}
                onSelectAll={() => handleSelectAll('shopping-list', shoppingList as any)}
                onClearSelection={handleClearSelection}
                onBulkMove={() => handleBulkMove('shopping-list')}
                onBulkRemove={handleBulkRemove}
                isBulkMoving={bulkMovePending}
                isBulkRemoving={bulkRemovePending}
                moveButtonLabel='Move to Have'
              />
            )}

            <div className='space-y-6'>
              <ShoppingList
                items={shoppingList}
                onRemoveItem={handleRemoveItem}
                onMoveItem={(id) => handleMoveItem(id, 'shopping-list')}
                isRemoving={removeItemPending}
                isMoving={moveItemPending}
                selectionMode={shoppingListSelectionMode}
                selectedItems={selectedItems}
                onToggleSelection={handleToggleSelection}
              />
            </div>
          </section>

          <section>
            <div className='mb-6 flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10'>
                <ShoppingCart className='h-6 w-6 text-red-400' />
              </div>
              <div>
                <h2 className='text-xl font-light text-red-300 sm:text-2xl'>Have</h2>
                <span className='rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium text-red-300'>
                  {haveList.length} items
                </span>
              </div>
            </div>

            {haveList.length > 0 && (
              <BulkActionsToolbar
                selectionMode={haveListSelectionMode}
                selectedCount={Array.from(selectedItems).filter((id) => haveList.some((item) => item._id === id)).length}
                onToggleSelectionMode={toggleHaveListSelectionMode}
                onSelectAll={() => handleSelectAll('have-list', haveList as any)}
                onClearSelection={handleClearSelection}
                onBulkMove={() => handleBulkMove('have-list')}
                onBulkRemove={handleBulkRemove}
                isBulkMoving={bulkMovePending}
                isBulkRemoving={bulkRemovePending}
                moveButtonLabel='Move to Shopping'
              />
            )}

            <div className='space-y-3'>
              <HaveList
                items={haveList}
                onRemoveItem={handleRemoveItem}
                onMoveItem={(id) => handleMoveItem(id, 'have-list')}
                isRemoving={removeItemPending}
                isMoving={moveItemPending}
                selectionMode={haveListSelectionMode}
                selectedItems={selectedItems}
                onToggleSelection={handleToggleSelection}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
