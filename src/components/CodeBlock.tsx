import React, { ClassAttributes, HTMLAttributes } from 'react'
import { ExtraProps } from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus as styles } from 'react-syntax-highlighter/dist/esm/styles/prism'
import CopyButton from './CopyButton'

type CodeBlockProps = {
  children?: React.ReactNode
  language?: string
  props?: React.ComponentProps<typeof SyntaxHighlighter>
} & ClassAttributes<HTMLElement> &
  HTMLAttributes<HTMLElement> &
  ExtraProps

const CodeBlock = ({ children = '', language = 'plaintext', props }: CodeBlockProps) => {
  return (
    <div className='relative mt-2 py-4 flex w-full flex-col'>
      <div className='flex w-full items-center justify-between rounded-t-xl  bg-neutral-800 px-4 py-2 text-sm text-neutral-300'>
        <span className='font-mono'>{language}</span>
        <CopyButton btnClassName={'transition-colors hover:text-white'} text={String(children)} />
      </div>
      <pre className='!mt-0 !rounded-t-none'>
        <SyntaxHighlighter
          codeTagProps={{
            style: {
              whiteSpace: 'pre',
              color: 'rgb(212, 212, 212)',
              fontSize: '13px',
              textShadow: 'none',
              fontFamily:
                'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
              direction: 'ltr',
              textAlign: 'left',
              wordSpacing: 'normal',
              wordBreak: 'normal',
              lineHeight: '1.5',
              tabSize: 4,
              hyphens: 'none',
            },
          }}
          customStyle={{
            color: 'rgb(212, 212, 212)',
            fontSize: '13px',
            textShadow: 'none',
            fontFamily:
              'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
            direction: 'ltr',
            textAlign: 'left',
            whiteSpace: 'pre',
            wordSpacing: 'normal',
            wordBreak: 'normal',
            lineHeight: '1.5',
            tabSize: '4',
            hyphens: 'none',
            margin: '0.1rem 0px',
            overflow: 'auto',
            background: 'rgb(30, 30, 30)',
            borderBottomLeftRadius: '0.75rem',
            borderBottomRightRadius: '0.75rem',
          }}
          className='scrollbar scrollbar-track-transparent scrollbar-thumb-neutral-500 scroll-smooth'
          language={language}
          style={styles}
          {...props}
        >
          {String(children)}
        </SyntaxHighlighter>
      </pre>
    </div>
  )
}

export default CodeBlock
