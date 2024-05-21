"use server"

export const getUser = async ({ userId }: { userId: string }) => {

  const response = await fetch(`https://api.github.com/users/${userId}`)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return await response.json() as Object

}

