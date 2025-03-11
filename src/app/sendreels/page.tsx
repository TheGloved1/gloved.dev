'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { downloadReel } from '@/lib/actions';
import React, { useState } from 'react';

const ReelDownloader = () => {
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await downloadReel(link);

    if (response.success) {
      setMessage('Video posted to Discord!');
      setLink('');
    } else {
      setMessage('Error sending to Discord.');
    }
    setLoading(false);
  };

  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <h1 className='mb-4 text-4xl font-bold'>Reel Downloader (Enter Link to send me Reels)</h1>
      <form onSubmit={handleDownload} className='mx-auto flex w-full flex-col md:w-1/2 lg:w-1/3'>
        <Input
          type='url'
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder='Enter Instagram Reel Link'
          required
          className='rounded-md border border-gray-500 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
        <Button
          type='submit'
          disabled={loading}
          className='mt-4 rounded-md bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700'
        >
          {loading ? 'Downloading...' : 'Send to Discord'}
        </Button>
      </form>
      <p className='mt-4'>{message}</p>
    </div>
  );
};

export default ReelDownloader;
