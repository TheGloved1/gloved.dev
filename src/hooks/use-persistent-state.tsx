import { Dispatch, SetStateAction, useEffect, useState } from 'react';

/**
 * Custom hook to manage a state variable that is synchronized with localStorage.
 *
 * @template T - The type of the state variable.
 * @param {string} key - The key under which the state is stored in localStorage.
 * @param {T} initialValue - The initial value of the state if not found in localStorage.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} - The current state and a function to update it.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T,
  enabled: boolean = true,
): [T, Dispatch<SetStateAction<T>>] {
  if (enabled === undefined) enabled = true;
  const inBrowser = () => typeof window !== 'undefined';
  const [state, setState] = useState<T>(() => {
    if (inBrowser() && enabled) {
      try {
        const storedState = localStorage.getItem(key);
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
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
}
