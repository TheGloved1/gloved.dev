import { ClassAttributes, HTMLAttributes } from 'react'
import Markdown, { Components, ExtraProps, Options } from 'react-markdown'
import CodeBlock from './CodeBlock'

const components: Components = {
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

/**
 * A React component that renders Markdown content using custom components for specific elements.
 * It utilizes the `react-markdown` library for parsing and rendering Markdown.
 *
 * @param {Options} props - The props for the Markdown component.
 * @param {React.ReactNode} props.children - The Markdown content to be rendered.
 * @returns {React.JSX.Element} The rendered Markdown content as a React element.
 */
export default function CustomMarkdown({ children, ...props }: Options): React.JSX.Element {
  return (
    <Markdown components={components} {...props}>
      {children}
    </Markdown>
  )
}
