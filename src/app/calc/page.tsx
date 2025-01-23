import React from 'react'
import CalculatorPage from './CalculatorPage'
import { Calc, NAME } from '@/lib/constants'
import { Metadata } from 'next'

export const meta: Metadata = {
  title: NAME + ' | ' + Calc.title,
  description: Calc.description,
}

export default function Page(): React.JSX.Element {
  return <CalculatorPage />
}
