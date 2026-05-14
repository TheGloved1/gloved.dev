'use client';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ClearButton, EqualsButton, NumberButton, OperatorButton } from './Button';

function displayFontSize(len: number) {
  if (len <= 6) return 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl';
  if (len <= 10) return 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl';
  if (len <= 15) return 'text-xl sm:text-2xl md:text-3xl lg:text-4xl';
  return 'text-lg sm:text-xl md:text-2xl lg:text-3xl';
}

export default function CalculatorPage(): React.JSX.Element {
  const [display, setDisplay] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [display]);

  const appendToDisplay = useCallback((value: string) => {
    setDisplay((prev) => prev + value);
    setIsError(false);
  }, []);

  const calculate = useCallback(() => {
    setIsCalculating(true);
    setTimeout(() => {
      try {
        const sanitizedDisplay = display
          .replace(/[^\d+\-*/.()^eE]/g, '')
          .replace(/√(\d+)/g, 'Math.sqrt($1)')
          .replace(/^(-?\d+(\.\d+)?)[eE](-?\d+(\.\d+)?)$/, 'Math.pow($1, $3)')
          .replace(/\(\-/g, '(0-');
        let result: number | string = eval(sanitizedDisplay);
        if (typeof result === 'number' && (Math.abs(result) > 1e6 || Math.abs(result) < 1e-6)) {
          result = result.toExponential();
        }
        setDisplay(result.toString());
        setIsError(false);
      } catch {
        setDisplay('');
        setIsError(true);
        setTimeout(() => {
          setIsError(false);
        }, 3000);
      } finally {
        setIsCalculating(false);
      }
    }, 1000);
  }, [display]);

  const clearDisplay = useCallback(() => {
    setDisplay('');
    setIsError(false);
  }, []);

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white selection:bg-fuchsia-500/30'>
      <div className='grid-pattern pointer-events-none fixed inset-0' />
      <div className='noise-overlay' />

      <Link
        href={'/'}
        onClick={(e) => {
          e.preventDefault();
          if (window.history.length > 1) window.history.back();
          else window.location.href = '/';
        }}
        className='fixed left-3 top-3 z-50'
      >
        <Button className='brutal-shadow-sm border border-fuchsia-500/50 bg-fuchsia-500/10 text-xs text-white hover:bg-fuchsia-500/20'>
          <ChevronLeft className='h-4 w-4' />
          <span className='hidden sm:block'>Back</span>
        </Button>
      </Link>

      <div className='mx-auto w-full max-w-xs px-4 sm:max-w-sm md:max-w-md lg:max-w-lg'>
        <div
          className={`rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm sm:p-4 md:p-5 ${isCalculating ? 'animate-spin' : ''}`}
        >
          <textarea
            ref={textareaRef}
            className={`font-mono-industrial max-h-44 w-full resize-none overflow-hidden rounded-xl border-none bg-white/5 p-3 text-right font-medium tracking-tight outline-none ring-0 focus-visible:ring-0 sm:p-4 ${displayFontSize(display.length)} ${
              isError ? 'text-red-400' : 'text-white'
            }`}
            readOnly
            value={isError ? 'Error' : display || '0'}
          />

          <div className='mt-2 grid grid-cols-4 gap-1.5 sm:mt-3 sm:gap-2 md:gap-2.5'>
            <ClearButton onClick={clearDisplay} disabled={isCalculating}>
              AC
            </ClearButton>
            <OperatorButton onClick={() => appendToDisplay('(')} disabled={isCalculating}>
              (
            </OperatorButton>
            <OperatorButton onClick={() => appendToDisplay(')')} disabled={isCalculating}>
              )
            </OperatorButton>
            <OperatorButton onClick={() => appendToDisplay('^')} disabled={isCalculating}>
              ^
            </OperatorButton>

            <NumberButton onClick={() => appendToDisplay('7')} disabled={isCalculating}>
              7
            </NumberButton>
            <NumberButton onClick={() => appendToDisplay('8')} disabled={isCalculating}>
              8
            </NumberButton>
            <NumberButton onClick={() => appendToDisplay('9')} disabled={isCalculating}>
              9
            </NumberButton>
            <OperatorButton onClick={() => appendToDisplay('/')} disabled={isCalculating}>
              /
            </OperatorButton>

            <NumberButton onClick={() => appendToDisplay('4')} disabled={isCalculating}>
              4
            </NumberButton>
            <NumberButton onClick={() => appendToDisplay('5')} disabled={isCalculating}>
              5
            </NumberButton>
            <NumberButton onClick={() => appendToDisplay('6')} disabled={isCalculating}>
              6
            </NumberButton>
            <OperatorButton onClick={() => appendToDisplay('*')} disabled={isCalculating}>
              x
            </OperatorButton>

            <NumberButton onClick={() => appendToDisplay('1')} disabled={isCalculating}>
              1
            </NumberButton>
            <NumberButton onClick={() => appendToDisplay('2')} disabled={isCalculating}>
              2
            </NumberButton>
            <NumberButton onClick={() => appendToDisplay('3')} disabled={isCalculating}>
              3
            </NumberButton>
            <OperatorButton onClick={() => appendToDisplay('-')} disabled={isCalculating}>
              -
            </OperatorButton>

            <NumberButton onClick={() => appendToDisplay('0')} disabled={isCalculating}>
              0
            </NumberButton>
            <NumberButton onClick={() => appendToDisplay('.')} disabled={isCalculating}>
              .
            </NumberButton>
            <EqualsButton onClick={calculate} disabled={isCalculating}>
              =
            </EqualsButton>
            <OperatorButton onClick={() => appendToDisplay('+')} disabled={isCalculating}>
              +
            </OperatorButton>
          </div>
        </div>
      </div>
    </div>
  );
}
