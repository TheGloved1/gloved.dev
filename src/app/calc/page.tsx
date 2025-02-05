import { Calc, NAME } from '@/lib/constants'
import { Metadata } from 'next'
import React from 'react'
import CalculatorPage from './CalculatorPage'

export const metadata: Metadata = {
  title: NAME + ' | ' + Calc.title,
  description: Calc.description,
}

export default function Page(): React.JSX.Element {
  return <CalculatorPage />
}
