import { useState } from 'react'
import { Link } from '@remix-run/react'
import { apiRoute } from '@/lib/utils'
import VideoPreview from '@/components/VideoPreview'
import Button, { LinkButton } from '@/components/Buttons'
import Dialog from '@/components/Dialog'

type FileButtonProps = {
  file: string
  temp?: boolean
  size?: string
}

export default function FileButton({ file, temp, size }: FileButtonProps): React.JSX.Element {
  const [showDialog, setShowDialog] = useState(false)
  const encodedFileName = encodeURIComponent(file)
  const tempQuery = temp ? '?temp=true' : ''
  const fileUrl = apiRoute(`/files/download/${encodedFileName}${tempQuery}`)
  const previewUrl = apiRoute(`/files/view/${encodedFileName}${tempQuery}`)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewUrl)
    setShowDialog(false)
  }

  const isVideo = (fileName: string) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv']
    return videoExtensions.some((ext) => fileName.toLowerCase().endsWith(ext))
  }

  const isImage = (fileName: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp']
    return imageExtensions.some((ext) => fileName.toLowerCase().endsWith(ext))
  }

  const getMimeType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'avi':
        return 'video/x-msvideo'
      case 'webm':
        return 'video/webm'
      case 'mkv':
        return 'video/x-matroska'
      default:
        return 'video/mp4'
    }
  }

  return (
    <>
      <div className='mx-2 w-64 truncate rounded-xl'>
        <button
          onClick={() => setShowDialog(true)}
          className='btn mx-2 rounded-xl p-3 hover:animate-pulse hover:bg-gray-700'
        >
          {file}
        </button>
      </div>

      <Dialog isOpen={showDialog} onClose={() => setShowDialog(false)}>
        <h2 className='p-4 text-base'>
          {file} ({size})
        </h2>
        {(isVideo(file) && (
          <div className='mb-4 w-full max-w-md items-center justify-center self-center'>
            {file.toLowerCase().endsWith('.mkv') ?
              <h2 className='rounded-xl bg-gray-700 p-4 text-center text-base'>
                MKV format cannot be previewed here.
                <LinkButton
                  to={previewUrl}
                  onClick={() => {
                    setShowDialog(false)
                  }}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Preview
                </LinkButton>
              </h2>
            : <VideoPreview className='w-full max-w-md rounded-xl' src={previewUrl} type={getMimeType(file)} />}
          </div>
        )) ||
          (isImage(file) && (
            <div className='mb-4 w-full max-w-md items-center justify-center'>
              <Link
                className='block w-full max-w-md rounded-xl'
                to={previewUrl}
                onClick={() => {
                  setShowDialog(false)
                }}
                target='_blank'
                rel='noopener noreferrer'
              >
                <img src={previewUrl} alt={file} className='w-full max-w-md rounded-xl' />
              </Link>
            </div>
          )) ||
          null}
        <div className='grid grid-cols-2 items-center justify-center'>
          <Button onClick={() => copyToClipboard()}>Copy</Button>
          <LinkButton to={fileUrl} onClick={() => setShowDialog(false)}>
            Download
          </LinkButton>
        </div>
      </Dialog>
    </>
  )
}
