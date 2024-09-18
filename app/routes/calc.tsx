import React from 'react'
import CalculatorPage from './calc/CalculatorPage'
import { Calc, NAME } from '@/lib/constants'
import { MetaFunction } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [{ title: NAME + ' | ' + Calc.title }, { name: 'description', content: Calc.description }]
}

export default function Page(): React.JSX.Element {
  return <CalculatorPage />
}
