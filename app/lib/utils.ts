import { API } from '@/lib/constants'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely awaits a promise or a value and returns the result or throws an error.
 * @param input - The promise or value to await.
 * @returns The result of the promise or value.
 * @throws The error if the promise or value rejects.
 */
export async function safeAwait<T, E = Error>(input: Promise<T> | T): Promise<[T, null] | [null, E]> {
  try {
    const result = await Promise.resolve(input)
    return [result, null]
  } catch (err) {
    return [null, err as E]
  }
}

export async function apiFetch(route: string, options?: RequestInit) {
  const res = await fetch(apiRoute(route), options)
  return res.json()
}

export function apiRoute(route: string) {
  return `${API}${route}`
}
