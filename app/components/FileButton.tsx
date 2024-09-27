import { useState } from 'react'
import { Link } from '@remix-run/react'
import { apiRoute } from '@/lib/utils'

export default function FileButton({ file }: { file: string }): React.JSX.Element {
  const [showDialog, setShowDialog] = useState(false)
  const encodedFileName = encodeURIComponent(file)
  const fileUrl = apiRoute(`/files/download/${encodedFileName}`)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fileUrl)
    setShowDialog(false)
    // Optionally, you can show a toast or alert to confirm the copy action
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
              <div>
                <button onClick={copyToClipboard} className='btn m-2 rounded-xl p-4 hover:animate-pulse hover:bg-gray-700'>
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
