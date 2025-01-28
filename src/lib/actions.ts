'use server'
import sharp from 'sharp'

export async function fetchImage(src: string) {
  const buffer = await fetch(src).then(async (res) => Buffer.from(await res.arrayBuffer()))
  try {
    const resizedBuffer = await sharp(buffer)
      .resize(75) // Resize to a smaller size
      .toBuffer() // Convert to buffer
    console.log(`Fetched image buffer data for ${src}: ${resizedBuffer.toString('base64')}`)
    return resizedBuffer
  } catch (error) {
    console.error('Error creating placeholder image:', error)
    return null
  }
}
