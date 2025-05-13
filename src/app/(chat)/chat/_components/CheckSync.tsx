'use client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { checkSync } from '@/lib/dexie';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';

/**
 * Checks if it has been more than 30 seconds since the last sync, and if so,
 * calls `dxdb.syncDexie` to synchronize the database with the remote data.
 * The last sync time is stored in local storage to prevent excessive reads and writes to the database.
 * @returns {null} This component does not render anything.
 */
export default function CheckSync(): null {
  const [syncEnabled] = useLocalStorage<boolean>('syncEnabled', false);
  const auth = useAuth();
  useEffect(() => {
    if (auth.userId && syncEnabled) {
      checkSync(auth.userId);
    }
  }, [auth.userId, syncEnabled]);
  return null;
}
