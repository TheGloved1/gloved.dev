import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

function githubUser(username: string) {
  return async () => {
    const response = await fetch(`https://api.github.com/users/${username}`)
    return response.json()
  }
}

export function getGithubUser(username: string) {
  return githubUser(username)()
}
