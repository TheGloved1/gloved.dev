import React from 'react'
import CalculatorPage from './calc/CalculatorPage'
import { NAME } from '@/lib/constants'
import { MetaFunction } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [{ title: NAME + ' | Calculator' }, { name: 'description', content: 'A simple calculator web app. Do math calculations.' }]
}

export default function Page(): React.JSX.Element {
  return <CalculatorPage />
}
