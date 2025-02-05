'use client'
import ScrollLink from '@/components/ScrollLink'
import { useState } from 'react'

const DropdownMenu = ({ sections }: { sections: string[] }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <div className='dropdown dropdown-end'>
      <div role='button' className='btn btn-ghost' onClick={toggleDropdown}>
        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 6h16M4 12h8m-8 6h16' />
        </svg>
      </div>
      {isOpen && (
        <ul className='menu menu-vertical absolute right-2 top-2 z-[1000] -translate-x-12 rounded-box bg-zinc-800 p-2 shadow'>
          {sections.map((section) => (
            <li key={section} className='m-1 rounded-xl bg-zinc-700'>
              <ScrollLink href={`#${section}`} onClick={toggleDropdown}>
                {section}
              </ScrollLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DropdownMenu
