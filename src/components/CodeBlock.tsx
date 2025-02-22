import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus as styles } from 'react-syntax-highlighter/dist/esm/styles/prism'
import CopyButton from './CopyButton'

type CodeBlockProps = {
  children?: React.ReactNode
  language?: string
  props?: React.ComponentProps<typeof SyntaxHighlighter>
}
const CodeBlock = ({ children = '', language = 'plaintext', props }: CodeBlockProps) => {

  return (
    <div className='relative'>
      <div className='absolute inset-x-0 top-0 flex items-center justify-between border-foreground border h-10 px-4 py-2 text-xs bg-gray-900 rounded-t-lg text-muted-foreground'>
        <span className='font-mono'>{language}</span>
        <CopyButton text={String(children)} />
      </div>
      <SyntaxHighlighter
        customStyle={{
          maxWidth: '70vw',
          overflow: 'scroll',
          borderWidth: '1px',
          borderColor: 'hsl(var(--foreground))',
          borderRadius: '0.5rem',
          padding: '1rem',
          paddingTop: '3rem',
        }}
        useInlineStyles
        language={language}
        style={styles}
        {...props}
      >
        {String(children)}
      </SyntaxHighlighter>
    </div>
  )
}

export default CodeBlock
