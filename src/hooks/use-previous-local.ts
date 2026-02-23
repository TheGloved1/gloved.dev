import { useState } from 'react';
import { useLocalStorage } from './use-local-storage';

export function usePreviousLocal<T>(key: string, value: T) {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useLocalStorage<T | undefined>(key, undefined);

  if (value !== current) {
    setPrevious(current);
    setCurrent(value);
  }

  return [previous, setPrevious] as const;
}
