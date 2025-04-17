'use client';
import PageBack from '@/components/PageBack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAllUserShortenedUrlsAction, setShortenedUrlAction } from '@/lib/actions';
import { tryCatch } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [longUrl, setLongUrl] = useState('');
  const urlsQuery = useQuery({
    queryKey: ['urls', auth.userId],
    queryFn: async () => {
      if (!auth.userId) return {};
      const urls = await tryCatch(getAllUserShortenedUrlsAction(auth.userId));
      if (urls.error) {
        console.log('Error fetching URLs:', urls.error);
        toast.error('Error fetching URLs');
        return {};
      }
      return urls.data;
    },
    initialData: {},
  });

  const createShortUrl = useMutation({
    mutationFn: async (newUrl: string) => {
      if (!auth.userId) throw new Error('You must be signed in to shorten a URL');
      const id = crypto.randomUUID().slice(0, 8);
      const shortenedUrlAction = await tryCatch(setShortenedUrlAction(auth.userId, id, newUrl));
      if (shortenedUrlAction.error) {
        console.log('Error shortening URL:', shortenedUrlAction.error);
        toast.error('Error shortening URL');
        throw shortenedUrlAction.error;
      }
      return window.location.origin + '/s/' + id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['urls', auth.userId] });
    },
  });

  const getShortenedUrl = (id: string) => {
    return window.location.origin + '/s/' + id;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth.userId)
      return toast.error('You must be logged in to shorten a URL', {
        description: 'Go to the home page and log in',
      });
    createShortUrl.mutate(longUrl);
  };

  return (
    <main className='flex min-h-screen w-screen flex-col items-center justify-center bg-neutral-950 text-white'>
      <PageBack />
      <h1 className='text-4xl font-bold'>Link Shortener</h1>
      {auth.userId ?
        <>
          <form onSubmit={handleSubmit} className='mt-4 flex flex-col gap-2'>
            <Label htmlFor='longUrl' className='text-lg'>
              Enter URL to shorten:
            </Label>
            <Input
              type='url'
              id='longUrl'
              value={longUrl}
              onChange={(event) => setLongUrl(event.target.value)}
              placeholder='https://example.com'
              className='rounded-lg bg-neutral-800 p-2 text-lg'
              required
            />
            <Button type='submit' className='rounded-lg bg-neutral-700 p-2 text-lg font-bold'>
              {createShortUrl.isPending ? 'Shortening...' : 'Shorten URL'}
            </Button>
            {createShortUrl.data && (
              <p className='mt-2 text-lg'>
                Shortened URL: <Link href={createShortUrl.data}>{createShortUrl.data}</Link>
              </p>
            )}
          </form>
          <h2 className='mt-4 text-lg font-bold'>Your Shortened URLs</h2>
          <ul className='mt-4 flex flex-col gap-2 rounded-lg border border-border bg-neutral-800 p-4 shadow-lg md:w-1/2 lg:w-1/3'>
            {urlsQuery.isPending ?
              <li className='flex items-center justify-center rounded-lg p-2 transition duration-200 hover:bg-neutral-700'>
                <Loader2 className='animate-spin' />
              </li>
            : urlsQuery.error ?
              <li className='flex items-center justify-center rounded-lg p-2 transition duration-200 hover:bg-neutral-700'>
                Unable to fetch your shortened URLs: {urlsQuery.error.message}
              </li>
            : Object.entries(urlsQuery.data ?? {}).length === 0 ?
              <li className='flex items-center justify-center rounded-lg p-2 transition duration-200 hover:bg-neutral-700'>
                {"You haven't shortened any URLs yet."}
              </li>
            : Object.entries(urlsQuery.data ?? {}).map(([id, url]) => (
                <li
                  key={id}
                  className='flex items-center justify-between rounded-lg p-2 transition duration-200 hover:bg-neutral-700'
                >
                  <span className='flex-1 flex-col items-start'>
                    <a href={url} className='hover:underline'>
                      {url}
                    </a>{' '}
                    <div className='text-xs'>{getShortenedUrl(id)}</div>
                  </span>
                  <Button
                    onClick={() => navigator.clipboard.writeText(getShortenedUrl(id))}
                    className='rounded-lg bg-neutral-700 p-2 text-lg font-bold'
                  >
                    Copy URL
                  </Button>
                </li>
              ))
            }
          </ul>
        </>
      : <p className='mt-4 text-center text-lg font-bold'>
          You must be signed in to shorten URLs. Go to the home page and sign in.
        </p>
      }
    </main>
  );
}
