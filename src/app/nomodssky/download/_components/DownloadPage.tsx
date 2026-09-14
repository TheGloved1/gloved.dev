'use client';

import { Button } from '@/components/ui/button';
import { minutes } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { CloudDownload, Download, ExternalLink, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GitHubRelease, PlatformIcon, PlatformKey, findReleaseAssets } from '../../_components/platform';
import '../../nms.css';

const PLATFORMS: { key: PlatformKey; label: string }[] = [
  { key: 'Windows', label: 'Windows' },
  { key: 'Mac', label: 'macOS' },
  { key: 'Linux', label: 'Linux' },
];

const RECOMMENDED_EXT: Record<PlatformKey, string> = {
  Windows: 'msi',
  Mac: 'dmg',
  Linux: 'AppImage',
  Debian: 'deb',
  Fedora: 'rpm',
};

const EXT_PLATFORM_MAP: Record<PlatformKey, string[]> = {
  Windows: ['msi', 'exe'],
  Mac: ['dmg'],
  Linux: ['AppImage'],
  Debian: ['deb'],
  Fedora: ['rpm'],
};

function getExtPlatform(ext: string) {
  return (Object.entries(EXT_PLATFORM_MAP).find(([_, e]) => e.includes(ext))?.[0] as PlatformKey) || 'Windows';
}

function detectPlatform(): PlatformKey {
  if (typeof navigator === 'undefined') return 'Windows';
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'Mac';
  if (ua.includes('Fedora')) return 'Fedora';
  if (ua.includes('Debian')) return 'Debian';
  if (ua.includes('Linux')) return 'Linux';
  return 'Windows';
}

export default function DownloadPage(): React.JSX.Element {
  const [detectedPlatform] = useState<PlatformKey>(detectPlatform());
  const [activePlatform, setActivePlatform] = useState<PlatformKey>('Windows');

  useEffect(() => {
    setActivePlatform(detectedPlatform);
  }, [detectedPlatform]);

  const latestRelease = useQuery({
    queryKey: ['nomodssky-latest-release'],
    queryFn: async () => {
      const res = await fetch('https://api.github.com/repos/TheGloved1/NoModsSky/releases/latest');
      if (!res.ok) throw new Error('Failed to fetch latest release');
      return (await res.json()) as GitHubRelease;
    },
    staleTime: minutes(10),
  });

  const assets = latestRelease.data ? findReleaseAssets(latestRelease.data) : null;
  const detectedAssets = assets?.[detectedPlatform] ?? null;
  const platformAssets = assets?.[activePlatform] ?? null;
  const release = latestRelease.data;

  const detectedRecommended =
    detectedAssets?.find((a) => a.ext === RECOMMENDED_EXT[detectedPlatform]) ?? detectedAssets?.[0] ?? null;

  const tabRecommended =
    platformAssets?.find((a) => a.ext === RECOMMENDED_EXT[activePlatform]) ?? platformAssets?.[0] ?? null;
  const tabOthers = platformAssets?.filter((a) => a.name !== tabRecommended?.name) ?? [];

  return (
    <div className='relative px-4 pb-20 pt-24 sm:pb-28 sm:pt-32 lg:pt-40'>
      <div className='mx-auto max-w-3xl'>
        {/* Header */}
        <div className='mb-8 text-center'>
          <h1 className='font-nms-heading text-3xl font-bold tracking-wide text-[#00d4ff] sm:text-4xl'>
            Download NoModsSky
          </h1>
        </div>

        {/* Loading state */}
        {latestRelease.isLoading && (
          <div className='mb-8 flex min-h-[160px] items-center justify-center'>
            <div className='flex flex-col items-center gap-3'>
              <Loader2 className='h-5 w-5 animate-spin text-[#00d4ff]' />
              <p className='text-xs text-[#5a6d8a]'>Fetching latest release...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {latestRelease.isError && (
          <div className='mb-8 flex min-h-[160px] items-center justify-center'>
            <div className='rounded-lg border border-[#ff3344]/30 bg-[#ff3344]/10 px-6 py-4 text-center'>
              <p className='text-sm text-[#ff3344]/80'>Failed to load release info. Try again later.</p>
            </div>
          </div>
        )}

        {/* Recommended download — based on detected OS */}
        {latestRelease.data && (
          <>
            {detectedRecommended && (
              <a
                href={`/nomodssky/download/latest?platform=${detectedPlatform}&ext=${detectedRecommended.ext}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <button className='flex w-full items-center justify-center gap-3 rounded-t-lg border border-[#0099cc] bg-[#00d4ff] px-6 py-6 text-base font-bold tracking-wide text-[#0a0f1a] shadow-[0_0_10px_rgba(0,212,255,0.2)] transition-all duration-150 hover:shadow-[0_0_16px_rgba(0,212,255,0.3)] hover:brightness-110 active:brightness-90'>
                  <PlatformIcon platform={detectedPlatform} className='h-5 w-5' />
                  Download
                  <Download className='h-5 w-5' />
                </button>
              </a>
            )}

            {/* Release info */}
            <div className='mb-8 rounded-b-lg border border-[#1a2a45] bg-[#111b2d] px-4 py-3'>
              <div className='flex flex-wrap items-center justify-between gap-2 text-xs text-[#5a6d8a]'>
                <span>
                  Version <span className='text-[#8ea0c0]'>{release?.tag_name}</span>
                  &nbsp;&middot;&nbsp; Published{' '}
                  {release?.published_at ?
                    new Date(release.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : ''}
                </span>
                <a
                  href={release?.html_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-1 text-[#8ea0c0] transition-colors hover:text-[#00d4ff]'
                >
                  View on GitHub <ExternalLink className='h-3 w-3' />
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className='mb-8 flex items-center gap-2'>
              <div className='h-px flex-1 bg-gradient-to-r from-transparent via-[#1a2a45] to-transparent' />
              <span className='font-nms-heading text-xs tracking-wide text-[#5a6d8a]'>Other platforms</span>
              <div className='h-px flex-1 bg-gradient-to-r from-transparent via-[#1a2a45] to-transparent' />
            </div>

            {/* Platform tabs */}
            <div className='mb-3 flex flex-wrap rounded-lg bg-[#1a2a45] p-1'>
              {PLATFORMS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActivePlatform(key)}
                  className={`flex grow basis-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-center text-sm font-medium transition-all duration-150 ${
                    activePlatform === key ?
                      'border border-[#0099cc]/30 bg-[#111b2d] text-[#00d4ff]'
                    : 'text-[#8ea0c0] hover:text-[#e6f1ff]'
                  }`}
                >
                  <PlatformIcon platform={key} className='h-5 w-5' />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content — Prism-style article cards */}
            {platformAssets && platformAssets.length > 0 && (
              <div className='mb-3'>
                <article className='rounded-lg border border-[#1a2a45] bg-[#111b2d] px-4 py-3 sm:px-3'>
                  <div className='space-y-3'>
                    {platformAssets.map((asset) => (
                      <a
                        key={asset.name}
                        href={`/nomodssky/download/latest?platform=${activePlatform}&ext=${asset.ext}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block'
                      >
                        <Button
                          className={`flex w-full items-center justify-center gap-3 rounded-md px-5 py-3 text-base font-medium transition-all duration-150 hover:brightness-110 focus:brightness-110 active:brightness-90 ${
                            asset.ext === RECOMMENDED_EXT[activePlatform] ?
                              'border border-[#0099cc] bg-[#00d4ff] text-[#0a0f1a] shadow-[0_0_6px_rgba(0,212,255,0.15)]'
                            : 'border border-[#1e3356] bg-[#1a2a45] text-[#8ea0c0] hover:border-[#0099cc]/50 hover:text-[#e6f1ff]'
                          }`}
                        >
                          <PlatformIcon platform={getExtPlatform(asset.ext)} className='h-5 w-5 shrink-0' />
                          <span className='truncate'>{asset.name}</span>
                          <CloudDownload className='h-5 w-5 shrink-0' />
                        </Button>
                      </a>
                    ))}
                  </div>
                </article>
              </div>
            )}

            {!platformAssets?.length && (
              <p className='mb-6 text-sm text-[#5a6d8a]'>No downloads available for this platform in the latest release.</p>
            )}

            {/* Not sure section */}
            <div className='rounded-lg border border-[#1a2a45] bg-[#111b2d] px-5 py-4'>
              <h3 className='font-nms-heading mb-1 text-xs tracking-wide text-[#8ea0c0]'>Not sure which to pick?</h3>
              <p className='text-xs leading-relaxed text-[#5a6d8a]'>
                <strong className='text-[#8ea0c0]'>Windows:</strong> The MSI installer is recommended for most users.
                <br />
                <strong className='text-[#8ea0c0]'>macOS:</strong> Download the DMG disk image.
                <br />
                <strong className='text-[#8ea0c0]'>Linux:</strong> Prefer the DEB package if you&apos;re on a Debian-based
                distro (Ubuntu, Mint, Pop!_OS). Use the AppImage as a universal fallback.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
