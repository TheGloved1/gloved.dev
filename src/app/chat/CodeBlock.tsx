import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus as styles } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CodeBlock = ({ value = '', language = 'plaintext' }: { value: string; language?: string }) => {
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
      {value}
    </SyntaxHighlighter>
  )
}

export default CodeBlock
