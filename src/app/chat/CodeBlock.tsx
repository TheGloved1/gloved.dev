import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus as styles } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CodeBlock = ({ children = '', language = 'plaintext' }: { children?: React.ReactNode; language?: string }) => {
  return (
    <SyntaxHighlighter
      customStyle={{
        maxWidth: '70vw',
        overflow: 'scroll',
      }}
      useInlineStyles
      language={language}
      style={styles}
    >
      {String(children)}
    </SyntaxHighlighter>
  )
}

export default CodeBlock
