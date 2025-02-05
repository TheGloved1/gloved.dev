import { Dispatch, SetStateAction, useEffect, useState } from 'react'

function inBrowser() {
  return typeof window !== 'undefined'
}

/**
 * Custom hook to manage a state variable that is synchronized with localStorage.
 *
 * @template T - The type of the state variable.
 * @param {string} key - The key under which the state is stored in localStorage.
 * @param {T} initialValue - The initial value of the state if not found in localStorage.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>]} - The current state and a function to update it.
 */
export function usePersistentState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (inBrowser()) {
      try {
        const storedState = localStorage.getItem(key)
        return storedState ? JSON.parse(storedState) : initialValue
      } catch (error) {
        console.error('Error parsing localStorage data:', error)
        return initialValue
      }
    }
    return initialValue // Return initial value if not in the browser
  })

  useEffect(() => {
    if (inBrowser()) {
      // Save the value to localStorage whenever it changes
      localStorage.setItem(key, JSON.stringify(state))
    }
  }, [key, state])

  return [state, setState]
}
