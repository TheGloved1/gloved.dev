import { API } from '@/lib/constants'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { env } from '@/env'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a promise that resolves after a specified amount of time.
 * @param ms - The amount of milliseconds to wait.
 * @returns A promise that resolves after the specified amount of time.
 */
export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Safely await a promise or value, catching any errors that may occur.
 * @param input - A promise or value to await.
 * @returns A tuple containing the result of the input, or null if there was an error, and the error itself, or null if there was no error.
 */
export async function safeAwait<T, E = Error>(input: Promise<T> | T): Promise<[T, null] | [null, E]> {
  try {
    const result = await Promise.resolve(input)
    return [result, null]
  } catch (error) {
    return [null, error as E]
  }
}

/**
 * Makes a request to the API with the given route and options.
 * @param route - The route to make the request to.
 * @param options - The optional options to use when making the request.
 * @returns The response of the request, or null if an error occurred.
 */
export async function apiFetch(route: string, options?: RequestInit) {
  const res = await safeAwait(fetch(apiRoute(route), options))
  return res
}

/**
 * Generates the API route by concatenating the base API URL with the provided route.
 * @param route - The API route to be appended to the base API URL.
 * @returns The complete API route.
 */
export function apiRoute(route: string) {
  return `${API}${route}`
}

export function checkDevMode(): boolean {
  const environment = env.NODE_ENV

  if (environment === 'development') {
    return true
  }
  return false
}
