import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type UseUrlConfig<T> = {
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
};

/**
 * Hook to manage state in the URL search parameters.
 *
 * @param key The key to store the value in the URL search parameters.
 * @param defaultValue The default value to return if no value is stored in the URL search parameters with the given key.
 * @param config An object with the following options:
 *   - serialize: A function to serialize the value to a string.
 *     Default is JSON.stringify.
 *   - deserialize: A function to parse the stored string to a value.
 *     Default is JSON.parse.
 *
 * @returns An array with the stored value and a setter function to update
 * the stored value.
 */
export function useUrl<T>(key: string, defaultValue: T, config?: UseUrlConfig<T>): [T | null, (value: T) => void] {
  const { serialize, deserialize } = config || {};
  const router = useRouter();
  const searchParams = useSearchParams();

  // Default serialization functions
  const defaultSerialize = (value: T): string => JSON.stringify(value);
  const defaultDeserialize = (value: string): T => JSON.parse(value);

  const [value, setValue] = useState<T | null>(() => {
    const param = searchParams.get(key);

    if (param) {
      try {
        return (deserialize || defaultDeserialize)(param);
      } catch {
        return defaultValue || null;
      }
    }
    return defaultValue || null;
  });

  const updateURL = (newValue: T | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!newValue) {
      params.delete(key);
    } else {
      const serializedValue = (serialize || defaultSerialize)(newValue);
      params.set(key, serializedValue);
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.push(newUrl);
  };

  useEffect(() => {
    const param = searchParams.get(key);

    if (param) {
      try {
        setValue((deserialize || defaultDeserialize)(param));
      } catch {
        setValue(defaultValue || ({} as T));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, key, deserialize, defaultValue]);

  return [value, updateURL];
}
