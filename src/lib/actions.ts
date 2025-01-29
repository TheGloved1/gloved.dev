'use server'
import sharp from 'sharp'

export async function fetchImage(src: string) {
  const buffer = await fetch(src).then(async (res) => Buffer.from(await res.arrayBuffer()))
  const resizedBuffer = await sharp(buffer).blur(1).resize(10).toBuffer() // Convert to buffer
  console.log(`Fetched image buffer data for ${src}: ${resizedBuffer.toString('base64')}`)
  return resizedBuffer
}
