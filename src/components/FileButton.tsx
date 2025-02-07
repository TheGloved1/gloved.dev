'use client'
import Button, { LinkButton } from '@/components/Buttons'
import Dialog from '@/components/Dialog'
import VideoPreview from '@/components/VideoPreview'
import { useIsMobile } from '@/hooks/use-mobile'
import { apiRoute } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
/**
 * Props for the FileButton component
 *
 * @prop {string} file - name of the file to be downloaded
 * @prop {boolean} [temp] - whether the file is temporary or not
 * @prop {string} [size] - size of the file in human-readable format
 */
type FileButtonProps = {
  file: string
  temp?: boolean
  size?: string
}

/**
 * Component to display a file with a button to copy or download it.
 * When clicked, it shows a dialog with options to copy the URL or download the file.
 * If the file is an image or video, it will be previewed in the dialog.
 * @param {FileButtonProps} props
 * @param {string} props.file - name of the file to be downloaded
 * @param {boolean} [props.temp] - whether the file is temporary or not
 * @param {string} [props.size] - size of the file in human-readable format
 * @returns {React.JSX.Element}
 */
export default function FileButton({ file, temp, size }: FileButtonProps): React.JSX.Element {
  const [showDialog, setShowDialog] = useState(false)
  const encodedFileName = encodeURIComponent(file)
  const tempQuery = temp ? '?temp=true' : ''
  const fileUrl = apiRoute(`/files/download/${encodedFileName}${tempQuery}`)
  const previewUrl = apiRoute(`/files/view/${encodedFileName}${tempQuery}`)
  const isMobile = useIsMobile()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileUrl)
    setShowDialog(false)
  }

  const isVideo = (fileName: string): boolean => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv']
    return videoExtensions.some((ext) => fileName.toLowerCase().endsWith(ext))
  }

  const isImage = (fileName: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp']
    return imageExtensions.some((ext) => fileName.toLowerCase().endsWith(ext))
  }

  const getMimeType = (fileName: string): `video/${string}` => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'mov':
        return 'video/quicktime'
      case 'avi':
        return 'video/x-msvideo'
      case 'webm':
        return 'video/webm'
      default:
        return 'video/mp4'
    }
  }

  return (
    <>
      <div className='mx-2 w-64 truncate rounded-xl'>
        <button
          onClick={() => setShowDialog(true)}
          className='p-3 mx-2 rounded-xl btn hover:animate-pulse hover:bg-gray-700'
        >
          {file}
        </button>
      </div>

      <Dialog open={showDialog} close={() => setShowDialog(false)}>
        <h2
          className={`justify-center self-center max-w-[70vw] m-2 pt-8 px-2 text-center overscroll-contain ${isMobile ? 'text-xs scale-75' : 'text-base'}`}
        >
          {file} ({size})
        </h2>
        {(isVideo(file) && (
          <div className='mb-4 max-h-[80dvh] max-w-[80vw] items-center justify-center self-center'>
            {file.toLowerCase().endsWith('.mkv') ?
              <h2 className='p-4 text-base text-center bg-gray-700 rounded-xl'>
                MKV format cannot be previewed here.
                <LinkButton
                  href={previewUrl}
                  onClick={() => {
                    setShowDialog(false)
                  }}
                  targetAndRel
                >
                  Preview
                </LinkButton>
              </h2>
            : <VideoPreview className='max-w-md max-h-[250px] rounded-xl object-contain' src={previewUrl} />}
          </div>
        )) ||
          (isImage(file) && (
            <div className='justify-center items-center mb-4 w-full max-w-md'>
              <Link
                className='flex object-center justify-center content-center items-center self-center w-full max-w-md rounded-xl'
                href={previewUrl}
                onClick={() => {
                  setShowDialog(false)
                }}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Image src={previewUrl} alt={file} width={250} height={250} className='max-h-[300px] max-w-md rounded-xl' />
              </Link>
            </div>
          )) ||
          null}
        <div className='grid grid-cols-2 justify-center items-center'>
          <Button onClick={() => copyToClipboard()}>Copy</Button>
          <LinkButton href={fileUrl} onClick={() => setShowDialog(false)}>
            Download
          </LinkButton>
        </div>
      </Dialog>
    </>
  )
}
