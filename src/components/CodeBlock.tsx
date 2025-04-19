'use client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { tryCatch } from '@/lib/utils';
import React, { ClassAttributes, HTMLAttributes, useEffect, useState } from 'react';
import { ExtraProps } from 'react-markdown';
import { codeToHtml } from 'shiki';
import CopyButton from './CopyButton';
import { Theme, themes } from './ThemeChanger';

type CodeBlockProps = {
  children?: React.ReactNode;
  language?: string;
} & ClassAttributes<HTMLElement> &
  HTMLAttributes<HTMLElement> &
  ExtraProps;

const CodeBlock = ({ children = '', language = 'plaintext' }: CodeBlockProps) => {
  const [theme] = useLocalStorage<Theme>('theme', themes.cooldark);
  const [code, setCode] = useState(String(children));
  useEffect(() => {
    const getTheme = () => {
      switch (theme.className) {
        case themes.cooldark.className:
          return 'laserwave';
        case themes.dark.className:
          return 'dark-plus';
        case themes.light.className:
          return 'catppuccin-latte';
      }
    };
    const syntaxHighlighted = async () =>
      await codeToHtml(String(children), {
        lang: language,
        theme: getTheme(),
      });
    const promise = async () => {
      const highlighted = await tryCatch(syntaxHighlighted());
      if (highlighted.error) {
        console.error('Failed to highlight code', highlighted.error);
        setCode(String(children));
        return;
      }
      setCode(highlighted.data);
    };
    promise();
  }, [children, language, theme]);

  return (
    <div className='relative flex w-full flex-col py-1'>
      <div className='flex w-full items-center justify-between rounded-t-md bg-secondary px-4 py-2 text-sm text-foreground'>
        <span className='font-mono'>{language}</span>
        <CopyButton btnClassName={'transition-colors hover:text-white z-50'} className='!size-4' text={String(children)} />
      </div>
      <div
        className='not-prose relative rounded-b-md bg-accent text-sm text-secondary-foreground [&_pre]:overflow-auto [&_pre]:rounded-b-md [&_pre]:px-[1em] [&_pre]:py-[1em] [&_pre]:font-mono'
        dangerouslySetInnerHTML={{ __html: code }}
      ></div>
    </div>
  );
};

export default CodeBlock;
