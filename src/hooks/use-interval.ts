import { useEffect, useRef } from 'react';

/**
 * useInterval
 *
 * Calls the provided callback function every `delay` milliseconds.
 *
 * @param {() => void} callback The function to call every `delay` ms.
 * @param {number | null} delay The number of milliseconds to wait between calls.
 *   If `null`, the callback will not be called.
 *
 * @example
 * const [count, setCount] = useState(0);
 * useInterval(() => setCount(count + 1), 1000);
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(() => {});

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay || 0);
      return () => clearInterval(id);
    }
  }, [delay]);
}
