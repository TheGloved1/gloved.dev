import { useState } from 'react';

import { useEventListener } from './use-event-listener';
import { useMount } from './use-mount';

/**
 * Reactive online status
 *
 * @see https://react-hooks-library.vercel.app/core/useOnline
 */
export function useOnline() {
  const [online, setOnline] = useState(false);

  useMount(() => {
    setOnline(navigator.onLine);
  });

  useEventListener('offline', () => {
    setOnline(false);
  });

  useEventListener('online', () => {
    setOnline(true);
  });

  return online;
}
