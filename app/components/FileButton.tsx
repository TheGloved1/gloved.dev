import { useState } from 'react'
import { Link } from '@remix-run/react'
import { apiRoute } from '@/lib/utils'
import VideoPreview from './VideoPreview'

export default function FileButton({ file }: { file: string }): React.JSX.Element {
  const [showDialog, setShowDialog] = useState(false)
  const encodedFileName = encodeURIComponent(file)
  const fileUrl = apiRoute(`/files/download/${encodedFileName}`)
  const previewUrl = apiRoute(`/files/view/${encodedFileName}`)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewUrl)
    setShowDialog(false)
    // Optionally, you can show a toast or alert to confirm the copy action
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
      case 'mp4':
        return 'video/mp4'
      case 'mov':
        return 'video/quicktime'
      case 'avi':
        return 'video/x-msvideo'
      case 'webm':
        return 'video/webm'
      case 'mkv':
        return 'video/x-matroska'
      default:
        return 'video/mp4' // fallback to mp4
    }
  }

  return (
    <>
      <div className='mx-2 w-64 truncate rounded-xl'>
        <button onClick={() => setShowDialog(true)} className='btn mx-2 rounded-xl p-3 hover:animate-pulse hover:bg-gray-700'>
          {file}
        </button>
      </div>

      {showDialog && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-opacity-50`}>
          <div className='z-10 rounded-xl bg-gray-800 p-4 shadow-lg'>
            <div className='row-span-2 grid items-center justify-center py-1'>
              <h2 className='p-4 text-base'>{file}</h2>
              {(isVideo(file) && (
                <div className='mb-4 w-full max-w-md items-center justify-center'>
                  <VideoPreview src={previewUrl} type={getMimeType(file)} />
                </div>
              )) ||
                (isImage(file) && (
                  <div className='mb-4 w-full max-w-md items-center justify-center'>
                    <img src={fileUrl} alt={file} className='w-full max-w-md rounded-xl' />
                  </div>
                ))}
              <div>
                <button onClick={() => copyToClipboard()} className='btn m-2 rounded-xl p-4 hover:animate-pulse hover:bg-gray-700'>
                  Copy
                </button>
                <Link to={fileUrl} className='btn m-2 rounded-xl p-4 hover:animate-pulse hover:bg-gray-700' onClick={() => setShowDialog(false)}>
                  Download
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
