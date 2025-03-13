'use client';
import { Input } from '@/components/Input';
import { Button } from '@/components/ui/button';
import VideoPreview from '@/components/VideoPreview';
import { useIsMobile } from '@/hooks/use-mobile';
import { uploadReel } from '@/lib/actions';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<{ url: string; type: 'video' | 'image' } | null>(null);
  const isMobile = useIsMobile();

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await uploadReel(link);

    if (response.success) {
      setLink('');
      setPost(response.post);
      toast.success('Reel sent to Discord!');
    } else {
      toast.error('Error sending to Discord.');
    }
    setLoading(false);
  };

  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <h1 className='mb-4 text-2xl font-bold'>Reel Discord Uploader</h1>
      <form onSubmit={handleDownload} className='flex w-full flex-col items-center gap-2 p-2'>
        <div className='flex w-full items-center gap-2'>
          <Input
            type='url'
            value={link}
            onChange={(e) => setLink(e.target.value.trim())}
            placeholder='Enter Share Link to Reel'
            className='text-xs'
            required
          />
          <Button
            type='button'
            onClick={() => navigator.clipboard.readText().then((text) => setLink(text))}
            className='border-2 border-gray-700 p-2 hover:border-gray-900'
          >
            Paste
          </Button>
        </div>
        <span className='flex w-full items-center justify-center gap-2'>
          <Button
            variant='secondary'
            type='button'
            onClick={() => setLink('')}
            className='border-2 border-gray-700 p-4 hover:border-gray-900'
          >
            Clear
          </Button>
          <Button type='submit' disabled={loading} className='p-4'>
            {loading ? 'Downloading...' : 'Send to Discord'}
          </Button>
        </span>
        <span className='text-sm text-gray-400'>
          View uploaded reels{' '}
          <Link
            href='https://discord.com/channels/937806100546351174/1348939117190447136'
            target='_blank'
            rel='noopener noreferrer'
            className='fancy-link'
          >
            here
          </Link>
          .
        </span>
      </form>
      {post && !isMobile ?
        post.type === 'video' ?
          <VideoPreview src={post.url} className='max-w-[150px]' />
        : <Image width={150} height={150} src={post.url} alt='Reel' />
      : null}
    </div>
  );
}
