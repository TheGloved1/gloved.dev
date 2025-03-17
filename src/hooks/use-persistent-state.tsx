import { Dispatch, SetStateAction, useEffect, useState } from 'react';

/**
 * Custom hook to manage state that persists in localStorage.
 *
 * @template T - The type of the state value.
 * @param {string} key - The key under which the state is stored in localStorage.
 * @param {T} initialValue - The initial state value if no value is found in localStorage.
 * @param {boolean} [enabled=true] - Flag to enable or disable persistence.
 * @returns {[T, Dispatch<SetStateAction<T>>, () => T]} - The current state, a function to update it, and a function to get the current state from localStorage.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  enabled: boolean = true,
): [T, Dispatch<SetStateAction<T>>, () => T] {
  if (enabled === undefined) enabled = true;
  const inBrowser = () => typeof window !== 'undefined';
  const [state, setState] = useState<T>(() => {
    if (inBrowser() && enabled) {
      try {
        const storedState = localStorage.getItem(key)?.trim();
        return storedState ? JSON.parse(storedState) : initialValue;
      } catch (error) {
        console.error(`Error parsing localStorage data for key '${key}': `, error);
        return initialValue;
      }
    }
    return initialValue;
  });

  useEffect(() => {
    if (inBrowser()) {
      if (state) {
        localStorage.setItem(key, JSON.stringify(state));
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [key, state]);

  const getState = () => {
    if (inBrowser() && enabled) {
      try {
        const storedState = localStorage.getItem(key)?.trim();
        return storedState ? JSON.parse(storedState) : initialValue;
      } catch (error) {
        console.error(`Error parsing localStorage data for key '${key}': `, error);
        return initialValue;
      }
    }
    return initialValue;
  };

  return [state, setState, getState];
}
