import { ClassAttributes, HTMLAttributes } from 'react'
import Markdown, { Components, ExtraProps, Options } from 'react-markdown'
import CodeBlock from './CodeBlock'

const MarkdownComponents: Components = {
  code: ({
    children,
    className,
    ...props
  }: ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement> & ExtraProps): React.JSX.Element => {
    const language = className?.split('-').pop() || 'plaintext'
    return (
      <CodeBlock language={language} {...props}>
        {children}
      </CodeBlock>
    )
  },
}

export default function MarkdownComponent({ children, ...props }: Options) {
  return (
    <Markdown components={MarkdownComponents} {...props}>
      {children}
    </Markdown>
  )
}
