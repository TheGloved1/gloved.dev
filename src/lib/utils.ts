import axios from 'axios'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import Constants from './constants'

/**
 * A wrapper around `tailwind-merge` and `clsx` to concisely merge classnames.
 *
 * @param inputs - The classnames to merge.
 * @returns The merged classnames.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a promise that resolves after a specified amount of time.
 * @param ms - The amount of milliseconds to wait.
 * @returns A promise that resolves after the specified amount of time.
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Makes a request to the API with the given route and options.
 * @param route - The route to make the request to.
 * @param options - The optional options to use when making the request.
 * @returns The response of the request, or null if an error occurred.
 */
export async function apiFetch(route: string, options?: RequestInit) {
  const res = await tryCatch(fetch(apiRoute(route), options))
  return res
}

/**
 * Generates the API route by concatenating the base API URL with the provided route.
 * @param route - The API route to be appended to the base API URL.
 * @returns The complete API route.
 */
export function apiRoute(route: string) {
  return `${Constants.API}${route}`
}

export async function fetchIp() {
  const response = await axios.get<{ ip: string }>('https://api64.ipify.org?format=json')
  console.log('Client IP:', response.data.ip)
  return response.data.ip
}
// Types for the result object with discriminated union
type Success<T> = {
  data: T
  error: null
}

type Failure<E> = {
  data: null
  error: E
}

type Result<T, E = Error> = Success<T> | Failure<E>

/**
 * Makes a promise, and returns a result object with a discriminated union.
 * If the promise resolves, the result object will contain the resolved value in the `data` property, and `null` in the `error` property.
 * If the promise rejects, the result object will contain `null` in the `data` property, and the error in the `error` property.
 * @param promise - The promise to make.
 * @returns A result object with a discriminated union.
 */
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    const data = await promise
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as E }
  }
}
