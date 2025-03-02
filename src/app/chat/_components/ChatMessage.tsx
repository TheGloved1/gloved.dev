'use client';
import Markdown from '@/components/Markdown';
import { Message } from '@/dexie';
import { ImagePart, TextPart } from 'ai';
import { Copy, SquarePen } from 'lucide-react';
import Image from 'next/image';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import Timestamp from './Timestamp';

const getTextParts = (content: string | (TextPart | ImagePart)[]) => {
  return Array.isArray(content) ?
      content
        .filter((part) => 'text' in part)
        .map((part) => part.text)
        .join('')
    : content;
};

const renderImages = (content: string | (TextPart | ImagePart)[]): React.JSX.Element[] | null => {
  if (Array.isArray(content)) {
    return content
      .filter((part) => 'image' in part)
      .map((imagePart) => (
        <Image
          key={imagePart.image as string}
          src={imagePart.image as string}
          alt={''}
          width={200}
          height={200}
          className='my-4 rounded-lg'
        />
      ));
  }
  return null;
};

export default memo(function ChatMessage({
  message,
  handleEditMessageAction,
}: {
  message: Message;
  handleEditMessageAction: (m: Message) => void;
}) {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (getTextParts(message.content).trim() === '' && renderImages(message.content) === null) return null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      key={message.id}
      id={message.id}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={
          message.role === 'user' ?
            `group relative inline-block max-w-[80%] break-words rounded-2xl bg-[#2D2D2D] p-4 text-left`
          : `group relative w-full max-w-full break-words`
        }
      >
        {renderImages(message.content)}
        <Markdown
          className={
            'prose prose-sm prose-neutral prose-invert max-w-none text-white prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0'
          }
        >
          {getTextParts(message.content)}
        </Markdown>

        {message.role === 'user' ?
          <div className='absolute right-0 mt-5 flex items-center gap-2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100'>
            <button
              className='inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-neutral-800/0 p-0 text-xs font-medium transition-colors hover:bg-neutral-700 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
              onClick={() => {
                navigator.clipboard.writeText(getTextParts(message.content));
                toast.success('Copied response to clipboard!');
              }}
            >
              <Copy className='-mb-0.5 -ml-0.5 !size-5' />
              <span className='sr-only'>Copy</span>
            </button>
            <button
              onClick={() => {
                handleEditMessageAction(message);
              }}
              className='inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-neutral-800/0 p-0 text-xs font-medium transition-colors hover:bg-neutral-700 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
            >
              <SquarePen className='-mb-0.5 -ml-0.5 !size-5' />
              <span className='sr-only'>Edit</span>
            </button>
          </div>
        : <div className='absolute left-0 mt-2 flex items-center gap-2'>
            <button
              onClick={() => {
                navigator.clipboard.writeText(getTextParts(message.content));
                toast.success('Copied response to clipboard!');
              }}
              className='inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground opacity-0 shadow-sm transition-opacity hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
            >
              <Copy className='-mb-0.5 -ml-0.5 !size-5' />
              Copy Response
            </button>
            <div className='opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100'>
              {isHovered ?
                <Timestamp date={message.created_at} model={message.model} />
              : null}
            </div>
          </div>
        }
      </div>
    </div>
  );
});
