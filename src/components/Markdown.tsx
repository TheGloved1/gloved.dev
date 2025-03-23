import { ClassAttributes, HTMLAttributes } from 'react';
import Markdown, { Components, ExtraProps, Options } from 'react-markdown';
import CodeBlock from './CodeBlock';

const components: Components = {
  code: ({
    children,
    className,
    node,
    ...props
  }: ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement> & ExtraProps): React.JSX.Element => {
    const language = className?.split('-').pop() || 'plaintext';
    if (language === 'plaintext') {
      return (
        <strong className='rounded border border-border bg-gray-600/50 px-1 font-bold' {...props}>
          {children}
        </strong>
      );
    }
    return (
      <CodeBlock node={node} language={language} {...props}>
        {children}
      </CodeBlock>
    );
  },
};

/**
 * A React component that renders Markdown content using custom components for specific elements.
 * It utilizes the `react-markdown` library for parsing and rendering Markdown.
 *
 * @param {Options} props - The props for the Markdown component.
 * @param {React.ReactNode} props.children - The Markdown content to be rendered.
 * @param {string} props.className - Optional className for the container div.
 * @returns {React.JSX.Element} The rendered Markdown content as a React element.
 */
export default function CustomMarkdown({
  children,
  className,
  ...props
}: Options & { className?: string }): React.JSX.Element {
  return (
    <div className={className || undefined}>
      <Markdown components={components} {...props}>
        {children}
      </Markdown>
    </div>
  );
}
