'use client'
import React from 'react'

interface OperatorButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  children: string
  disabled: boolean
}

export default function OperatorButton({ onClick, children, disabled }: OperatorButtonProps) {
  return (
    <button
      className="btn btn-circle m-1 h-[50px] w-[50px] bg-orange-400 p-2 text-[1.5rem] font-bold text-white hover:bg-orange-500 active:bg-orange-600 sm:h-[60px] sm:w-[60px] sm:text-[2rem] md:h-[70px] md:w-[70px] md:text-[2.5rem] lg:h-[80px] lg:w-[80px] lg:text-[3rem] xl:h-[100px] xl:w-[100px] xl:text-[3.5rem]"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
