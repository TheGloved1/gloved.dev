'use client';
import { Button } from '@/components/ui/button';
import { useMount } from '@/hooks/use-mount';
import {
  addGroceryItemAction,
  bulkMoveGroceryItemsAction,
  bulkRemoveGroceryItemsAction,
  getGroceryListsAction,
  moveGroceryItemAction,
  removeGroceryItemAction,
} from '@/lib/actions';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddItemForm from './add-item-form';
import BulkActionsToolbar from './bulk-actions-toolbar';
import HaveList from './have-list';
import ShoppingList from './shopping-list';

export default function GroceryPage(): React.JSX.Element {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [clientIP, setClientIP] = useState<string>('unknown');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [shoppingListSelectionMode, setShoppingListSelectionMode] = useState<boolean>(false);
  const [haveListSelectionMode, setHaveListSelectionMode] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Get user name from Clerk or fallback to 'unknown'
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
    return 'unknown';
  };

  // Get client IP
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (error) {
      console.error('Failed to get client IP:', error);
      return 'unknown';
    }
  };

  // Fetch client IP on component mount
  useMount(() => {
    getClientIP().then(setClientIP);
  });

  // Handle window focus/blur events (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleFocus = () => setIsFocused(true);
      const handleBlur = () => setIsFocused(false);

      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);

      return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
      };
    }
  }, []);

  // Handle visibility change (tab switching) (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleVisibilityChange = () => {
        setIsFocused(!document.hidden);
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);

  const userName = getUserName();

  // React Query for fetching lists
  const {
    data: lists,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['groceryLists'],
    queryFn: getGroceryListsAction,
    refetchInterval: isFocused ? 5000 : false, // Only refetch when focused
    refetchIntervalInBackground: false, // Don't refetch when tab is in background
    staleTime: 2000,
  });

  // Mutations for data modifications
  const addItemMutation = useMutation({
    mutationFn: ({ listKey, text }: { listKey: 'shopping-list' | 'have-list'; text: string }) =>
      addGroceryItemAction(listKey, text, userName || clientIP),
    onSuccess: () => {
      toast.success('Item added');
      queryClient.invalidateQueries({ queryKey: ['groceryLists'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to add item');
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ listKey, itemId }: { listKey: 'shopping-list' | 'have-list'; itemId: string }) =>
      removeGroceryItemAction(listKey, itemId, userName || clientIP),
    onSuccess: () => {
      toast.success('Item removed');
      queryClient.invalidateQueries({ queryKey: ['groceryLists'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove item');
    },
  });

  const moveItemMutation = useMutation({
    mutationFn: ({ itemId, fromList }: { itemId: string; fromList: 'shopping-list' | 'have-list' }) => {
      if (fromList === 'shopping-list') {
        // Move from Shopping List to Have List (have-list)
        const toList = 'have-list';
        return moveGroceryItemAction(fromList, toList, itemId, userName || clientIP);
      } else {
        // Move from Have List to Shopping List (shopping-list)
        const toList = 'shopping-list';
        return moveGroceryItemAction(fromList, toList, itemId, userName || clientIP);
      }
    },
    onSuccess: () => {
      toast.success('Item moved');
      queryClient.invalidateQueries({ queryKey: ['groceryLists'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to move item');
    },
  });

  const bulkRemoveMutation = useMutation({
    mutationFn: ({ listKey, itemIds }: { listKey: 'shopping-list' | 'have-list'; itemIds: string[] }) =>
      bulkRemoveGroceryItemsAction(listKey, itemIds, userName || clientIP),
    onSuccess: () => {
      toast.success('Items removed');
      setSelectedItems(new Set());
      setShoppingListSelectionMode(false);
      setHaveListSelectionMode(false);
      queryClient.invalidateQueries({ queryKey: ['groceryLists'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to remove items');
    },
  });

  const bulkMoveMutation = useMutation({
    mutationFn: ({ fromList, itemIds }: { fromList: 'shopping-list' | 'have-list'; itemIds: string[] }) => {
      const toList = fromList === 'shopping-list' ? 'have-list' : 'shopping-list';
      return bulkMoveGroceryItemsAction(fromList, toList, itemIds, userName || clientIP);
    },
    onSuccess: () => {
      toast.success('Items moved');
      setSelectedItems(new Set());
      setShoppingListSelectionMode(false);
      setHaveListSelectionMode(false);
      queryClient.invalidateQueries({ queryKey: ['groceryLists'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to move items');
    },
  });

  const handleAddItem = (listKey: 'shopping-list' | 'have-list', text: string) => {
    addItemMutation.mutate({ listKey, text });
  };

  const handleRemoveItem = (listKey: 'shopping-list' | 'have-list', itemId: string) => {
    removeItemMutation.mutate({ listKey, itemId });
  };

  const handleMoveItem = (itemId: string, fromList: 'shopping-list' | 'have-list') => {
    if (fromList === 'shopping-list') {
      // Move from Shopping List to Have List
      moveItemMutation.mutate({ itemId, fromList: 'shopping-list' });
    } else {
      // Move from Have List to Shopping List
      moveItemMutation.mutate({ itemId, fromList: 'have-list' });
    }
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
    const itemIds = items.map((item) => item.id);
    setSelectedItems(new Set(itemIds));
  };

  const handleClearSelection = () => {
    setSelectedItems(new Set());
  };

  const handleBulkRemove = (listKey: 'shopping-list' | 'have-list') => {
    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length === 0) return;
    bulkRemoveMutation.mutate({ listKey, itemIds: selectedIds });
  };

  const handleBulkMove = (fromList: 'shopping-list' | 'have-list') => {
    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length === 0) return;
    bulkMoveMutation.mutate({ fromList, itemIds: selectedIds });
  };

  const toggleShoppingListSelectionMode = () => {
    setShoppingListSelectionMode(!shoppingListSelectionMode);
    setHaveListSelectionMode(false); // Disable the other toolbar
    setSelectedItems(new Set());
  };

  const toggleHaveListSelectionMode = () => {
    setHaveListSelectionMode(!haveListSelectionMode);
    setShoppingListSelectionMode(false); // Disable the other toolbar
    setSelectedItems(new Set());
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black'>
        <div className='px-4 text-center'>
          <div className='mb-6 h-12 w-12 animate-spin rounded-full border border-red-500/30 border-t-red-500'></div>
          <p className='text-base text-red-400'>Loading your shopping lists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black px-4'>
        <div className='max-w-md text-center'>
          <p className='mb-6 text-base text-red-400'>
            {error instanceof Error ? error.message : 'Failed to load your shopping lists'}
          </p>
          <Button
            onClick={() => refetch()}
            className='rounded-xl bg-red-600 px-6 py-3 text-base text-white hover:bg-red-700'
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const listsData = lists ?? { shoppingList: [], haveList: [] };

  return (
    <div className='min-h-screen bg-black'>
      {/* Header */}
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
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode='modal' forceRedirectUrl='/groceries'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='rounded-lg border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10'
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-12'>
        <AddItemForm listKey='shopping-list' onAddItem={handleAddItem} isLoading={addItemMutation.isPending} />
        <div className='mt-6 space-y-12'>
          {/* Shopping List */}
          <section>
            <div className='mb-6 flex items-center gap-3'>
              <ShoppingCart className='h-6 w-6 text-red-500' />
              <h2 className='text-xl font-light text-red-300 sm:text-2xl'>Shopping List</h2>
              <span className='rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium text-red-300'>
                {listsData.shoppingList.length} items
              </span>
            </div>

            {listsData.shoppingList.length > 0 && (
              <BulkActionsToolbar
                selectionMode={shoppingListSelectionMode}
                selectedCount={
                  Array.from(selectedItems).filter((id) => listsData.shoppingList.some((item) => item.id === id)).length
                }
                onToggleSelectionMode={toggleShoppingListSelectionMode}
                onSelectAll={() => handleSelectAll('shopping-list', listsData.shoppingList)}
                onClearSelection={handleClearSelection}
                onBulkMove={() => handleBulkMove('shopping-list')}
                onBulkRemove={() => handleBulkRemove('shopping-list')}
                isBulkMoving={bulkMoveMutation.isPending}
                isBulkRemoving={bulkRemoveMutation.isPending}
                moveButtonLabel='Move to Have'
              />
            )}

            <div className='space-y-6'>
              <ShoppingList
                items={listsData.shoppingList}
                onRemoveItem={(id) => handleRemoveItem('shopping-list', id)}
                onMoveItem={(id) => handleMoveItem(id, 'shopping-list')}
                isRemoving={removeItemMutation.isPending}
                isMoving={moveItemMutation.isPending}
                selectionMode={shoppingListSelectionMode}
                selectedItems={selectedItems}
                onToggleSelection={handleToggleSelection}
              />
            </div>
          </section>

          {/* Have Section */}
          <section>
            <div className='mb-6 flex items-center gap-3'>
              <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10'>
                <ShoppingCart className='h-6 w-6 text-red-400' />
              </div>
              <div>
                <h2 className='text-xl font-light text-red-300 sm:text-2xl'>Have</h2>
                <span className='rounded-full bg-red-500/20 px-3 py-1 text-sm font-medium text-red-300'>
                  {listsData.haveList.length} items
                </span>
              </div>
            </div>

            {listsData.haveList.length > 0 && (
              <BulkActionsToolbar
                selectionMode={haveListSelectionMode}
                selectedCount={
                  Array.from(selectedItems).filter((id) => listsData.haveList.some((item) => item.id === id)).length
                }
                onToggleSelectionMode={toggleHaveListSelectionMode}
                onSelectAll={() => handleSelectAll('have-list', listsData.haveList)}
                onClearSelection={handleClearSelection}
                onBulkMove={() => handleBulkMove('have-list')}
                onBulkRemove={() => handleBulkRemove('have-list')}
                isBulkMoving={bulkMoveMutation.isPending}
                isBulkRemoving={bulkRemoveMutation.isPending}
                moveButtonLabel='Move to Shopping'
              />
            )}

            <div className='space-y-3'>
              <HaveList
                items={listsData.haveList}
                onRemoveItem={(id) => handleRemoveItem('have-list', id)}
                onMoveItem={(id) => handleMoveItem(id, 'have-list')}
                isRemoving={removeItemMutation.isPending}
                isMoving={moveItemMutation.isPending}
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
