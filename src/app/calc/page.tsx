import Constants from '@/lib/constants'
import { Metadata } from 'next'
import React from 'react'
import CalculatorPage from './_components/CalculatorPage'

export const metadata: Metadata = {
  title: Constants.NAME + ' | ' + Constants.Calc.title,
  description: Constants.Calc.description,
}

export default function Page(): React.JSX.Element {
  return <CalculatorPage />
}
