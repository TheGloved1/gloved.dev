import { useLocalStorage } from '@/hooks/use-local-storage';
import React, { ClassAttributes, HTMLAttributes } from 'react';
import { ExtraProps } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialOceanic, synthwave84, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import CopyButton from './CopyButton';
import { Theme, themes } from './ThemeChanger';

type CodeBlockProps = {
  children?: React.ReactNode;
  language?: string;
  props?: React.ComponentProps<typeof SyntaxHighlighter>;
} & ClassAttributes<HTMLElement> &
  HTMLAttributes<HTMLElement> &
  ExtraProps;

const CodeBlock = ({ children = '', language = 'plaintext', props }: CodeBlockProps) => {
  const [theme] = useLocalStorage<Theme>('theme', themes.cooldark);
  const getSyntaxTheme = () => {
    switch (theme.className) {
      case 'cool-dark':
        return synthwave84;
      case 'dark':
        return vscDarkPlus;
      case 'light':
        return materialOceanic;
    }
  };
  return (
    <div className='relative flex w-full flex-col py-2'>
      <div className='flex w-full items-center justify-between rounded-t-sm bg-background px-4 py-2 text-sm text-foreground'>
        <span className='font-mono'>{language}</span>
        <CopyButton btnClassName={'transition-colors hover:text-white z-50'} className='!size-4' text={String(children)} />
      </div>
      <pre className='!mt-0 !rounded-t-none'>
        <SyntaxHighlighter
          codeTagProps={{
            style: {
              whiteSpace: 'pre',
              color: 'rgb(212, 212, 212)',
              fontSize: '12px',
              textShadow: 'none',
              fontFamily: 'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
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
            fontFamily: 'Menlo, Monaco, Consolas, "Andale Mono", "Ubuntu Mono", "Courier New", monospace',
            direction: 'ltr',
            textAlign: 'left',
            whiteSpace: 'pre',
            wordSpacing: 'normal',
            wordBreak: 'normal',
            lineHeight: '1.5',
            tabSize: '4',
            hyphens: 'none',
            margin: '0.0rem 0px',
            overflow: 'auto',
          }}
          className='scroll-smooth !rounded-t-none rounded-b-sm scrollbar scrollbar-track-transparent scrollbar-thumb-neutral-500'
          language={language}
          style={getSyntaxTheme()}
          {...props}
        >
          {String(children)}
        </SyntaxHighlighter>
      </pre>
    </div>
  );
};

export default CodeBlock;
