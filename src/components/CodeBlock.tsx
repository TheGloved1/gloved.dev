import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus as styles } from 'react-syntax-highlighter/dist/esm/styles/prism'

type CodeBlockProps = {
  children?: React.ReactNode
  language?: string
  props?: React.ComponentProps<typeof SyntaxHighlighter>
}
const CodeBlock = ({ children = '', language = 'plaintext', props }: CodeBlockProps) => {
  return (
    <SyntaxHighlighter
      customStyle={{
        maxWidth: '70vw',
        overflow: 'scroll',
      }}
      useInlineStyles
      language={language}
      style={styles}
      {...props}
    >
      {String(children)}
    </SyntaxHighlighter>
  )
}

export default CodeBlock
