import ChevronLeft from '@/components/ChevronLeft'
import { Link } from '@remix-run/react'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import Button from './Button'
import OperatorButton from './OperatorButton'
import EqualsButton from './EqualsButton'

export default function CalculatorPage(): React.JSX.Element {
  const [display, setDisplay] = useState<string>('')
  const [isError, setIsError] = useState<boolean>(false)
  const [isCalculating, setIsCalculating] = useState<boolean>(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto' // Reset height to auto to calculate the new height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px` // Set height based on scrollHeight
    }
  }, [display])

  const appendToDisplay = useCallback((value: string) => {
    setDisplay((prevDisplay) => prevDisplay + value)
    setIsError(false) // Reset error state when appending new values
  }, [])

  const calculate = useCallback(() => {
    setIsCalculating(true)
    setTimeout(() => {
      try {
        let result = eval(display.replace('√', 'Math.sqrt').replace('^', '**'))
        if (Math.abs(result) > 1e6 || Math.abs(result) < 1e-6) {
          result = result.toExponential()
        }
        setDisplay(result.toString())
        setIsError(false) // Reset error state on successful calculation
      } catch (error) {
        setDisplay('') // Clear the display on calculation error
        setIsError(true) // Set error state on calculation error
        setTimeout(() => {
          setIsError(false) // Reset error state after 3 seconds
        }, 3000)
      } finally {
        setIsCalculating(false)
      }
    }, 1000) // Simulate calculation delay
  }, [display])

  const clearDisplay = useCallback(() => {
    setDisplay('')
    setIsError(false) // Reset error state when clearing the display
  }, [])

  return (
    <>
      <Link to={'/'} className='fixed bottom-2 left-2 flex flex-row items-center justify-center pl-0 lg:bottom-auto lg:top-2'>
        <button className='btn flex flex-row items-center justify-center'>
          <ChevronLeft />
          {'Back'}
        </button>
      </Link>
      <div className='container flex h-dvh w-dvw flex-col items-center justify-center gap-12 px-4 py-16'>
        <div id='calculator' className='w-full max-w-xs rounded-2xl bg-gray-900 font-primary sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl'>
          <textarea
            id='display'
            ref={textareaRef}
            className={`max-h-44 w-full resize-none overflow-hidden rounded-t-2xl border-none p-2 text-left text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl ${isError ? 'text-red-500' : 'text-white'} ${isCalculating ? 'animate-spin' : ''}`}
            readOnly
            value={isError ? 'Error' : display}
          />
          <div className='flex flex-col gap-2 p-2'>
            <div className='grid grid-cols-4 gap-2 p-2'>
              <OperatorButton onClick={() => appendToDisplay('(')} disabled={isCalculating}>
                {'('}
              </OperatorButton>
              <OperatorButton onClick={() => appendToDisplay(')')} disabled={isCalculating}>
                {')'}
              </OperatorButton>
              <OperatorButton onClick={() => appendToDisplay('^')} disabled={isCalculating}>
                {'^'}
              </OperatorButton>
              <OperatorButton onClick={clearDisplay} disabled={isCalculating}>
                {'C'}
              </OperatorButton>
            </div>
          </div>
          <div className='flex flex-col gap-2 p-2'>
            <div id='regular-keys' className='grid grid-cols-4 gap-2 p-2'>
              <Button onClick={() => appendToDisplay('7')} disabled={isCalculating}>
                {'7'}
              </Button>
              <Button onClick={() => appendToDisplay('8')} disabled={isCalculating}>
                {'8'}
              </Button>
              <Button onClick={() => appendToDisplay('9')} disabled={isCalculating}>
                {'9'}
              </Button>
              <OperatorButton onClick={() => appendToDisplay('+')} disabled={isCalculating}>
                {'+'}
              </OperatorButton>
              <Button onClick={() => appendToDisplay('4')} disabled={isCalculating}>
                {'4'}
              </Button>
              <Button onClick={() => appendToDisplay('5')} disabled={isCalculating}>
                {'5'}
              </Button>
              <Button onClick={() => appendToDisplay('6')} disabled={isCalculating}>
                {'6'}
              </Button>
              <OperatorButton onClick={() => appendToDisplay('-')} disabled={isCalculating}>
                {'-'}
              </OperatorButton>
              <Button onClick={() => appendToDisplay('1')} disabled={isCalculating}>
                {'1'}
              </Button>
              <Button onClick={() => appendToDisplay('2')} disabled={isCalculating}>
                {'2'}
              </Button>
              <Button onClick={() => appendToDisplay('3')} disabled={isCalculating}>
                {'3'}
              </Button>
              <OperatorButton onClick={() => appendToDisplay('*')} disabled={isCalculating}>
                {'x'}
              </OperatorButton>
              <Button onClick={() => appendToDisplay('0')} disabled={isCalculating}>
                {'0'}
              </Button>
              <Button onClick={() => appendToDisplay('.')} disabled={isCalculating}>
                {'.'}
              </Button>
              <EqualsButton onClick={calculate} disabled={isCalculating}>
                {'='}
              </EqualsButton>
              <OperatorButton onClick={() => appendToDisplay('/')} disabled={isCalculating}>
                {'/'}
              </OperatorButton>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
