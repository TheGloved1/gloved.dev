'use client';
import { Input } from '@/components/Input';
import { Button } from '@/components/ui/button';
import { uploadReel } from '@/lib/actions';
import React, { useState } from 'react';
import { toast } from 'sonner';

const ReelDownloader = () => {
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await uploadReel(link);

    if (response.success) {
      setLink('');
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
        <Input
          type='url'
          value={link}
          onChange={(e) => setLink(e.target.value.trim())}
          placeholder='Enter Link to Reel'
          required
        />
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
          View reels on{' '}
          <a
            href='https://discord.com/channels/937806100546351174/1348939117190447136'
            target='_blank'
            rel='noopener noreferrer'
            className='fancy-link'
          >
            Discord
          </a>
        </span>
      </form>
    </div>
  );
};

export default ReelDownloader;
