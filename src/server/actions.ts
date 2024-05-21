"use server"

export const getUser = async ({ userId }: { userId: string }) => {

  const response = await fetch(`https://api.github.com/users/${userId}`)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()

}

export async function githubUser(username: string) {
  const response = await fetch(`https://api.github.com/users/${username}`)
  return response.json()
}

