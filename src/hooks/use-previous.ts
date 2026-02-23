import { useState } from 'react';

export function usePrevious<T>(value: T) {
  const [current, setCurrent] = useState(value);
  const [previous, setPrevious] = useState<T | undefined | null>(null);

  if (value !== current) {
    setPrevious(current);
    setCurrent(value);
  }

  return previous;
}
