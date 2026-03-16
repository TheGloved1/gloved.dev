'use client';
import PageBack from '@/components/PageBack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAllUserShortenedUrlsAction, setShortenedUrlAction } from '@/lib/actions';
import { tryCatch } from '@/lib/utils';
import { SignedIn, SignedOut, SignInButton, useAuth, UserButton } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, ExternalLink, Link2, Loader2, Scissors } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [longUrl, setLongUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        description: 'Go to home page and log in',
      });
    createShortUrl.mutate(longUrl);
  };

  const copyToClipboard = async (id: string) => {
    try {
      await navigator.clipboard.writeText(getShortenedUrl(id));
      setCopiedId(id);
      toast.success('URL copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  return (
    <main className='relative min-h-screen w-screen overflow-hidden bg-[#0a0a0a] text-white selection:bg-fuchsia-500/30'>
      {/* Background with grid pattern and noise */}
      <div className='absolute inset-0'>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDYwIEwgNjAgNjAgTSAzMCAwIEwgMzAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgb3BhY2l0eT0iMC4wMyIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-100"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIj48L2ZlVHVyYnVsZW5jZT48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjAzIi8+PC9zdmc+')] opacity-100"></div>
      </div>

      <div className='relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-8'>
        <div className='absolute right-4 top-4 flex items-center gap-4'>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode='modal'>
              <Button
                variant='outline'
                size='sm'
                className='font-mono-industrial rounded-none border border-fuchsia-500/30 bg-transparent px-4 py-2 text-sm text-fuchsia-400 hover:bg-fuchsia-500/10 hover:text-fuchsia-300'
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>

        <PageBack />

        {/* Header with brutalist styling */}
        <div className='mb-12 text-center'>
          <div className='brutal-shadow-sm mb-4 inline-flex items-center justify-center rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 p-4'>
            <Scissors className='h-8 w-8 text-fuchsia-400' />
          </div>
          <h1 className='font-display text-4xl font-bold uppercase tracking-tight text-white md:text-5xl'>Link Slicer</h1>
          <p className='font-mono-industrial mt-2 text-xs text-white/50'>URL SHORTENER</p>
        </div>

        {auth.userId ?
          <>
            {/* URL Input Section */}
            <div className='w-full max-w-2xl'>
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div className='relative'>
                  <Label htmlFor='longUrl' className='font-mono-industrial mb-2 block text-sm font-medium text-white'>
                    {'// ENTER TARGET URL'}
                  </Label>
                  <div className='relative'>
                    <Input
                      type='url'
                      id='longUrl'
                      value={longUrl}
                      onChange={(event) => setLongUrl(event.target.value)}
                      placeholder='https://your-massive-url.com/with/lots/of/parameters'
                      className='font-mono-industrial h-14 rounded-none border border-white/10 bg-white/5 p-4 text-lg text-white backdrop-blur-sm transition-all focus:border-fuchsia-500 focus:bg-fuchsia-500/5 focus:outline-none'
                      required
                    />
                    <div className='absolute right-4 top-1/2 -translate-y-1/2'>
                      <Link2 className='h-5 w-5 text-white/50' />
                    </div>
                  </div>
                </div>

                <Button
                  type='submit'
                  disabled={createShortUrl.isPending}
                  className='font-mono-industrial hover:brutal-shadow group relative h-14 w-full rounded-none border border-white/10 bg-white/5 text-lg font-medium text-white transition-all hover:border-fuchsia-500 hover:bg-fuchsia-500/10 active:translate-x-1 active:translate-y-1 disabled:opacity-50'
                >
                  <span className='relative z-10 flex items-center justify-center gap-2'>
                    {createShortUrl.isPending ?
                      <>
                        <Loader2 className='h-5 w-5 animate-spin' />
                        SLICING...
                      </>
                    : <>
                        <Scissors className='h-5 w-5' />
                        SLICE URL
                      </>
                    }
                  </span>
                </Button>

                {/* Success Result */}
                {createShortUrl.data && (
                  <div className='relative overflow-hidden rounded-none border border-green-500/30 bg-green-500/5 p-6 backdrop-blur-sm'>
                    <div className='absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent'></div>
                    <div className='relative z-10'>
                      <p className='font-mono-industrial mb-2 text-sm font-medium text-green-400'>{'// SLICE COMPLETE'}</p>
                      <div className='flex items-center justify-between gap-4'>
                        <Link
                          href={createShortUrl.data}
                          className='font-mono-industrial text-lg text-white hover:text-green-400'
                          target='_blank'
                        >
                          {createShortUrl.data}
                        </Link>
                        <Button
                          onClick={() => copyToClipboard(createShortUrl.data.split('/').pop()!)}
                          className='font-mono-industrial h-10 rounded-none border border-green-500/30 bg-transparent px-4 text-sm font-medium text-green-400 hover:bg-green-500/10 hover:text-green-300'
                        >
                          <Copy className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* URLs List Section */}
            <div className='mt-16 w-full max-w-4xl'>
              <div className='mb-6 flex items-center gap-4'>
                <h2 className='font-display text-2xl font-bold uppercase tracking-tight text-white'>YOUR SLICES</h2>
                <div className='h-0.5 flex-1 bg-gradient-to-r from-white/20 to-transparent'></div>
              </div>

              <div className='space-y-4'>
                {urlsQuery.isPending ?
                  <div className='flex items-center justify-center rounded-none border border-white/10 bg-white/5 p-8 backdrop-blur-sm'>
                    <Loader2 className='h-8 w-8 animate-spin text-white/50' />
                  </div>
                : urlsQuery.error ?
                  <div className='rounded-none border border-red-500/30 bg-red-500/5 p-6 backdrop-blur-sm'>
                    <p className='font-mono-industrial text-red-400'>ERROR: {urlsQuery.error.message}</p>
                  </div>
                : Object.entries(urlsQuery.data ?? {}).length === 0 ?
                  <div className='rounded-none border border-white/10 bg-white/5 p-8 backdrop-blur-sm'>
                    <p className='font-mono-industrial text-center text-white/50'>NO URLS SLICED YET. START ABOVE.</p>
                  </div>
                : Object.entries(urlsQuery.data ?? {}).map(([id, url]) => (
                    <div
                      key={id}
                      className='hover:brutal-shadow-sm group relative overflow-hidden rounded-none border border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5'
                    >
                      <div className='absolute inset-0 bg-gradient-to-r from-fuchsia-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100'></div>
                      <div className='relative z-10 p-4'>
                        <div className='flex items-start justify-between gap-4'>
                          <div className='min-w-0 flex-1'>
                            <Link
                              href={url}
                              className='font-mono-industrial block truncate text-sm text-white transition-colors hover:text-fuchsia-400'
                              target='_blank'
                            >
                              {url}
                            </Link>
                            <div className='mt-2 flex items-center gap-2'>
                              <span className='font-mono-industrial text-xs text-white/50'>{getShortenedUrl(id)}</span>
                              <Link
                                href={getShortenedUrl(id)}
                                target='_blank'
                                className='text-white/30 transition-colors hover:text-white/60'
                              >
                                <ExternalLink className='h-3 w-3' />
                              </Link>
                            </div>
                          </div>
                          <Button
                            onClick={() => copyToClipboard(id)}
                            className='font-mono-industrial h-10 rounded-none border border-white/10 bg-transparent px-3 text-xs font-medium text-white/70 transition-all hover:border-fuchsia-500 hover:bg-fuchsia-500/10 hover:text-fuchsia-400'
                          >
                            {copiedId === id ?
                              <Check className='h-4 w-4 text-green-400' />
                            : <Copy className='h-4 w-4' />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        : <div className='relative overflow-hidden rounded-none border border-white/10 bg-white/5 p-8 backdrop-blur-sm'>
            <div className='absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-transparent'></div>
            <div className='relative z-10 text-center'>
              <h2 className='font-display mb-4 text-2xl font-bold uppercase tracking-tight text-white'>
                AUTHENTICATION REQUIRED
              </h2>
              <p className='font-mono-industrial text-white/50'>SIGN IN TO START SLICING URLs</p>
            </div>
          </div>
        }
      </div>
    </main>
  );
}
