'use client';
import PageBack from '@/components/PageBack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EqualsButton, NumberButton, OperatorButton } from './Button';

export default function CalculatorPage(): React.JSX.Element {
  const [display, setDisplay] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to auto to calculate the new height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set height based on scrollHeight
    }
  }, [display]);

  const appendToDisplay = useCallback((value: string) => {
    setDisplay((prev) => prev + value);
    setIsError(false); // Reset error state when appending new values
  }, []);

  const calculate = useCallback(() => {
    setIsCalculating(true);
    setTimeout(() => {
      try {
        const sanitizedDisplay = display
          .replace(/[^\d\+\-\*\/\.\(\)\^eE]/g, '') // Replace any character that is not a number, +, -, *, /, ., (, ), ^, e, or E
          .replace(/√(\d+)/g, 'Math.sqrt($1)') // This will replace √9 with Math.sqrt(9)
          .replace(/^(-?\d+(\.\d+)?)[eE](-?\d+)$/, 'Math.pow($1, $3)') // Handle exponentiation (e.g. 2e3)
          .replace(/^(-?\d+(\.\d+)?)[eE](-?\d+(\.\d+)?)$/, 'Math.pow($1, $4)') // Handle exponentiation with decimal numbers (e.g. 2.3e-4)
          .replace(/^(-?\d+(\.\d+)?)[eE](-?\d+(\.\d+)?)$/, 'Math.pow($1, $4)') // Handle exponentiation with decimal numbers (e.g. 2.3e-4)
          .replace(/^(-?\d+(\.\d+)?)(\.\s*\^?\s*(-?\d+(\.\d+)?))$/, 'Math.pow($1, $4)') // Handle exponentiation with caret (e.g. 2^3)
          .replace(/\(\-/g, '(0-') // Handle negative numbers in parentheses
          .replace(/\(([+-]?\d*\.?\d+)\)/g, '($1)') // Handle numbers inside parentheses
          .replace(/\((\d+(\.\d+)?)\)(\d+(\.\d+)?)$/, '($1 * $3)') // Handle operations like (2)7
          .replace(/(\d+(\.\d+)?)\((\d+(\.\d+)?)\)*/, '($1 * $3)'); // Handle operations like 2(7)
        let result: number | string = eval(sanitizedDisplay);
        if (typeof result === 'number' && (Math.abs(result) > 1e6 || Math.abs(result) < 1e-6)) {
          result = result.toExponential();
        }
        setDisplay(result.toString());
        setIsError(false); // Reset error state on successful calculation
      } catch {
        setDisplay(''); // Clear the display on calculation error
        setIsError(true); // Set error state on calculation error
        setTimeout(() => {
          setIsError(false); // Reset error state after 3 seconds
        }, 3000);
      } finally {
        setIsCalculating(false);
      }
    }, 1000); // Simulate calculation delay
  }, [display]);

  const clearDisplay = useCallback(() => {
    setDisplay('');
    setIsError(false); // Reset error state when clearing the display
  }, []);

  return (
    <>
      <PageBack />
      <div className='container flex h-dvh w-dvw flex-col items-center justify-center gap-12 px-4 py-16'>
        <div
          id='calculator'
          className='font-primary w-full max-w-xs rounded-2xl bg-gray-900 sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl'
        >
          <textarea
            id='display'
            ref={textareaRef}
            className={`max-h-44 w-full resize-none overflow-hidden rounded-t-2xl border-none p-2 text-left text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl ${
              isError ? 'text-red-500' : 'text-white'
            } ${isCalculating ? 'animate-spin' : ''}`}
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
              <NumberButton onClick={() => appendToDisplay('7')} disabled={isCalculating}>
                {'7'}
              </NumberButton>
              <NumberButton onClick={() => appendToDisplay('8')} disabled={isCalculating}>
                {'8'}
              </NumberButton>
              <NumberButton onClick={() => appendToDisplay('9')} disabled={isCalculating}>
                {'9'}
              </NumberButton>
              <OperatorButton onClick={() => appendToDisplay('+')} disabled={isCalculating}>
                {'+'}
              </OperatorButton>
              <NumberButton onClick={() => appendToDisplay('4')} disabled={isCalculating}>
                {'4'}
              </NumberButton>
              <NumberButton onClick={() => appendToDisplay('5')} disabled={isCalculating}>
                {'5'}
              </NumberButton>
              <NumberButton onClick={() => appendToDisplay('6')} disabled={isCalculating}>
                {'6'}
              </NumberButton>
              <OperatorButton onClick={() => appendToDisplay('-')} disabled={isCalculating}>
                {'-'}
              </OperatorButton>
              <NumberButton onClick={() => appendToDisplay('1')} disabled={isCalculating}>
                {'1'}
              </NumberButton>
              <NumberButton onClick={() => appendToDisplay('2')} disabled={isCalculating}>
                {'2'}
              </NumberButton>
              <NumberButton onClick={() => appendToDisplay('3')} disabled={isCalculating}>
                {'3'}
              </NumberButton>
              <OperatorButton onClick={() => appendToDisplay('*')} disabled={isCalculating}>
                {'x'}
              </OperatorButton>
              <NumberButton onClick={() => appendToDisplay('.')} disabled={isCalculating}>
                {'.'}
              </NumberButton>
              <NumberButton onClick={() => appendToDisplay('0')} disabled={isCalculating}>
                {'0'}
              </NumberButton>
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
  );
}
