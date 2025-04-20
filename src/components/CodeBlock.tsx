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
    const promise = async () => {
      const highlighted = await tryCatch(
        codeToHtml(String(children), {
          lang: language,
          theme: getTheme(),
        }),
      );
      if (highlighted.error) {
        console.error('Failed to highlight code', highlighted.error);
        return;
      }
      setCode(highlighted.data);
    };
    promise();
  }, [children, language, theme]);

  return (
    <div className='relative mt-2 flex w-full flex-col pt-9'>
      <div className='absolute inset-x-0 top-0 flex h-9 items-center rounded-t bg-secondary px-4 py-2 text-sm text-secondary-foreground'>
        <span className='font-mono'>{language}</span>
      </div>
      <CopyButton text={String(children)} />
      <div className='-mb-1.5'></div>
      <div
        className='shiki not-prose relative bg-chat-accent text-sm font-[450] text-secondary-foreground [&_pre]:overflow-auto [&_pre]:!bg-transparent [&_pre]:px-[1em] [&_pre]:py-[1em]'
        dangerouslySetInnerHTML={{ __html: code }}
      ></div>
    </div>
  );
};

export default CodeBlock;
