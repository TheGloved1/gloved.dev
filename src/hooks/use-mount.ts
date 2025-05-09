import { Fn } from '@/lib/utils';
import { useEffect } from 'react';

/**
 * Run a function when a component is mounted.
 * @param callback function to be executed
 */
export function useMount(callback: Fn) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, []);
}
