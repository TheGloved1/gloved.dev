import { useState, useEffect } from 'react'

export function WIPHeader(): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    const timerFadeOut = setTimeout(() => {
      setIsFading(true)
      const timerDisappear = setTimeout(() => {
        setIsVisible(false)
      }, 2000)
      return () => clearTimeout(timerDisappear)
    }, 5000)

    return () => clearTimeout(timerFadeOut)
  }, [])

  return isVisible ?
      <div
        className={`fixed top-[10vh] flex items-center justify-center p-1 text-center font-bold md:text-[0.75rem] lg:text-5xl ${isFading ? 'opacity-0 transition-opacity duration-1000' : 'opacity-100'}`}
      >
        <div>{'gloved'}</div>
        <div className='text-[hsl(280,100%,40%)]'>{'.'}</div>
        <div>{'dev'}</div>
        <div className='text-[hsl(280,100%,40%)]'>{'/'}</div>
        <div className='pr-2'>{'home '}</div>
        <div className='rounded-xl bg-gray-700 p-2 text-slate-900'>{'Work in progress...'}</div>
      </div>
    : null
}
