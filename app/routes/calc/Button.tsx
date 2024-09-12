import React, { memo } from 'react'

interface ButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  children: string
  disabled: boolean
}

const Button: React.FC<ButtonProps> = memo(({ onClick, children, disabled }) => {
  return (
    <button
      className='btn btn-circle m-1 h-[50px] w-[50px] p-2 text-[1rem] font-bold text-white sm:h-[60px] sm:w-[60px] sm:text-[1.5rem] md:h-[70px] md:w-[70px] md:text-[2rem] lg:h-[80px] lg:w-[80px] lg:text-[2.5rem] xl:h-[100px] xl:w-[100px] xl:text-[3rem]'
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
})

export default memo(Button)
