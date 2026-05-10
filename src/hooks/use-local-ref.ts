import { useMemo } from 'react';

type LocalRef<T> = {
  current: T;
};

export default function useLocalRef<T>(key: string, initialValue: T): LocalRef<T> {
  return useMemo(() => {
    let currentValue = initialValue;

    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(key);
        if (stored !== null) {
          currentValue = JSON.parse(stored);
        }
      } catch {
        // silently fail
      }
    }

    return {
      get current(): T {
        return currentValue;
      },
      set current(value: T) {
        currentValue = value;
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(value));
          } catch {
            // silently fail
          }
        }
      },
    };
  }, [key, initialValue]);
}
