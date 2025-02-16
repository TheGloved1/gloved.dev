'use client'
import Button, { LinkButton } from '@/components/Buttons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useIsMobile } from '@/hooks/use-mobile'
import { apiRoute } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'
import { FileInfo } from './FileUploader'
import VideoPreview from './VideoPreview'

/**
 * Props for the FileButton component
 *
 * @prop {string} file - name of the file to be downloaded
 * @prop {boolean} [temp] - whether the file is temporary or not
 * @prop {string} [size] - size of the file in human-readable format
 */
type FileButtonProps = {
  file: FileInfo
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
export default function FileButton({ file }: FileButtonProps): React.JSX.Element {
  const [showDialog, setShowDialog] = useState(false)
  const encodedFileName = encodeURIComponent(file.name)
  const tempQuery = file.isTemp ? '?temp=true' : ''
  const fileUrl = apiRoute(`/files/download/${encodedFileName}${tempQuery}`)
  const previewUrl = apiRoute(`/files/view/${encodedFileName}${tempQuery}`)
  const isMobile = useIsMobile()

  const copyToClipboard = () => {
    console.log('Copied file URL:', fileUrl)
    navigator.clipboard.writeText(fileUrl)
    setShowDialog(false)
  }

  const isImage = file.name.match(/\.(jpeg|jpg|gif|png|webp)$/i)
  const isVideo = file.name.match(/\.(mp4|webm|ogg|mov|avi)$/i)

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
          {file.name}
        </button>
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className='sm:max-w-[425px] w-fit md:max-w-[650px]'>
          <DialogHeader>
            <DialogTitle className='text-base font-semibold'>{file.name}</DialogTitle>
            <DialogDescription className='text-xs font-light flex flex-wrap'>
              <span className='mr-2 text-left'>
                Size: <span className='badge badge-sm text-nowrap'>{file.size}</span>
              </span>
              <span className='mr-2 text-left'>
                Uploaded:{' '}
                <span className='badge badge-sm text-nowrap'>
                  {new Date(file.createdAt).toLocaleString()}
                </span>
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className='mt-4 flex justify-center items-center'>
            {isImage && (
              <Image
                width={isMobile ? 250 : 450}
                height={isMobile ? 250 : 450}
                src={previewUrl}
                alt={file.name}
                className='max-w-full h-auto rounded-xl'
              />
            )}
            {isVideo && (
              <VideoPreview
                className='max-w-md max-h-[250px] md:h-[350px] lg:h-[650px] rounded-xl'
                src={previewUrl}
              />
            )}
            {!isImage && !isVideo && null}
          </div>
          <div className='grid grid-cols-2 justify-center self-center items-center'>
            <Button onClick={() => copyToClipboard()}>Copy</Button>
            <LinkButton href={fileUrl} onClick={() => setShowDialog(false)}>
              Download
            </LinkButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
