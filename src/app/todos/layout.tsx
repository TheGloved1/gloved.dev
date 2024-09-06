import fonts from '@/lib/fonts'
import '@/styles/globals.css'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: 'gloved.dev | Todo App',
  description: 'A simple todo list web app. Uses local storage to save and get todos list even after reloading.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  return (
    <html lang='en' className={`${fonts.geistSans.variable} ${fonts.geistMono.variable} ${fonts.JetBrainsMono.variable}`}>
      <body className='font-primary h-dvh w-dvw bg-[#333]'>{children}</body>
    </html>
  )
}
