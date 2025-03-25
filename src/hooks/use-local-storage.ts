import React, { useEffect, useMemo, useRef, useState } from 'react';

type Serializer<T> = (object: T | undefined) => string;
type Parser<T> = (val: string) => T | undefined;
type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

type Options<T> = Partial<{
  serializer: Serializer<T>;
  parser: Parser<T>;
  logger: (error: unknown) => void;
  syncData: boolean;
}>;

/**
 * A hook to store value in local storage, and also synchronize the value
 * with other tabs that are using the same key.
 *
 * @param key The key to store the value in local storage.
 * @param defaultValue The default value to return if no value is stored with the given key.
 * @param options An object with the following options:
 *   - serializer: A function to serialize the value to a string.
 *     Default is JSON.stringify.
 *   - parser: A function to parse the stored string to a value.
 *     Default is JSON.parse.
 *   - logger: A function to log any errors that occur when attempting to
 *     parse the stored value.
 *     Default is console.error.
 *   - syncData: If set to true, the hook will use the storage event to
 *     synchronize the value across tabs.
 *     Default is false.
 *
 * @returns An array with the stored value and a setter function to update
 * the stored value.
 *
 * @example
 * const [count, setCount] = useLocalStorage('count', 0);
 * // ...
 * setCount(count + 1); // This will also update the value in other tabs and components
 */
function useLocalStorage<T>(key: string, defaultValue: T, options?: Options<T>): [T, Setter<T>];
function useLocalStorage<T>(key: string, defaultValue?: T, options?: Options<T>) {
  const opts = useMemo(() => {
    return {
      serializer: JSON.stringify,
      parser: JSON.parse,
      logger: console.log,
      syncData: true,
      ...options,
    };
  }, [options]);

  const { serializer, parser, logger, syncData } = opts;

  const rawValueRef = useRef<string | null>(null);

  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      rawValueRef.current = window.localStorage.getItem(key);
      const res: T = rawValueRef.current ? parser(rawValueRef.current) : defaultValue;
      return res;
    } catch (e) {
      logger(e);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateLocalStorage = () => {
      // Browser ONLY dispatch storage events to other tabs, NOT current tab.
      // We need to manually dispatch storage event for current tab
      if (value !== undefined) {
        const newValue = serializer(value);
        const oldValue = rawValueRef.current;
        rawValueRef.current = newValue;
        window.localStorage.setItem(key, newValue);
        window.dispatchEvent(
          new StorageEvent('storage', {
            storageArea: window.localStorage,
            url: window.location.href,
            key,
            newValue,
            oldValue,
          }),
        );
      } else {
        window.localStorage.removeItem(key);
        window.dispatchEvent(
          new StorageEvent('storage', {
            storageArea: window.localStorage,
            url: window.location.href,
            key,
          }),
        );
      }
    };

    try {
      updateLocalStorage();
    } catch (e) {
      logger(e);
    }
  }, [key, logger, serializer, value]);

  useEffect(() => {
    if (!syncData) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== window.localStorage) return;

      try {
        if (e.newValue !== rawValueRef.current) {
          rawValueRef.current = e.newValue;
          setValue(e.newValue ? parser(e.newValue) : undefined);
        }
      } catch (e) {
        logger(e);
      }
    };

    if (typeof window === 'undefined') return;

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, logger, parser, syncData]);

  return [value, setValue];
}

export { useLocalStorage };
