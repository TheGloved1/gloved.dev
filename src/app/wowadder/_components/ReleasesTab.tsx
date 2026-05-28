'use client';

import Markdown from '@/components/Markdown';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { CloudDownload, ExternalLink, GitBranch, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type GitHubRelease = {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string;
  prerelease: boolean;
  assets: {
    name: string;
    browser_download_url: string;
    content_type: string;
  }[];
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function findMsiAsset(release: GitHubRelease): string | null {
  const msi = release.assets.find((a) => a.name.endsWith('.msi') && a.name.includes('x64_en-US'));
  return msi?.browser_download_url ?? null;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  pages.push(1);

  if (current > 3) {
    pages.push('ellipsis');
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push('ellipsis');
  }

  pages.push(total);

  return pages;
}

export default function ReleasesTab(): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState(1);
  const [releasesPerPage, setReleasesPerPage] = useState(10);
  const [updaterNotes, setUpdaterNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    setCurrentPage(1);
  }, [releasesPerPage]);

  const releasesQuery = useQuery({
    queryKey: ['wowadder-releases'],
    queryFn: async () => {
      const res = await fetch('https://api.github.com/repos/TheGloved1/WowAdder/releases?per_page=100');
      if (!res.ok) throw new Error('Failed to fetch releases');
      return (await res.json()) as GitHubRelease[];
    },
    staleTime: 10 * 60 * 1000,
  });

  const releases = useMemo(() => releasesQuery.data ?? [], [releasesQuery.data]);

  const totalPages = Math.max(1, Math.ceil(releases.length / releasesPerPage));

  const paginatedReleases = useMemo(() => {
    const start = (currentPage - 1) * releasesPerPage;
    return releases.slice(start, start + releasesPerPage);
  }, [releases, currentPage, releasesPerPage]);

  const currentTags = useMemo(() => paginatedReleases.map((r) => r.tag_name), [paginatedReleases]);
  const attemptedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const missing = currentTags.filter((tag) => !attemptedRef.current.has(tag));
    if (missing.length === 0) return;

    const controller = new AbortController();

    for (const tag of missing) {
      attemptedRef.current.add(tag);
    }

    Promise.allSettled(
      missing.map(async (tag) => {
        const res = await fetch(`https://github.com/TheGloved1/WowAdder/releases/download/${tag}/updater.json`, {
          signal: controller.signal,
        });
        if (res.status === 404) return { tag, notes: '' };
        if (!res.ok) throw new Error('Failed');
        const data = (await res.json()) as { notes?: string };
        return { tag, notes: data.notes ?? '' };
      }),
    ).then((results) => {
      if (controller.signal.aborted) return;
      setUpdaterNotes((prev) => {
        const next = { ...prev };
        for (const r of results) {
          if (r.status === 'fulfilled' && r.value.notes) {
            next[r.value.tag] = r.value.notes;
          }
        }
        return next;
      });
    });

    return () => controller.abort();
  }, [currentTags]);

  const getChangelog = (release: GitHubRelease): string => {
    return updaterNotes[release.tag_name] || release.body || 'No changelog available.';
  };

  if (releasesQuery.isLoading) {
    return (
      <div className='flex min-h-[300px] items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='h-6 w-6 animate-spin text-amber-400' />
          <p className='font-mono-industrial text-xs text-white/40'>Loading releases...</p>
        </div>
      </div>
    );
  }

  if (releasesQuery.isError) {
    return (
      <div className='flex min-h-[300px] items-center justify-center'>
        <div className='rounded-xl border border-red-500/20 bg-red-500/5 px-8 py-6 text-center'>
          <p className='font-mono-industrial text-sm text-red-400'>Failed to load releases. Try again later.</p>
        </div>
      </div>
    );
  }

  if (releases.length === 0) {
    return (
      <div className='flex min-h-[300px] items-center justify-center'>
        <p className='font-mono-industrial text-sm text-white/40'>No releases found.</p>
      </div>
    );
  }

  return (
    <div className='relative py-8 sm:py-10'>
      <div className='mx-auto max-w-4xl'>
        {/* Top pagination bar */}
        {totalPages > 1 && (
          <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <span className='font-mono-industrial text-[11px] text-white/40'>Per page</span>
              <Select value={String(releasesPerPage)} onValueChange={(v) => setReleasesPerPage(Number(v))}>
                <SelectTrigger className='h-7 w-16 border-amber-500/20 bg-amber-500/5 text-xs text-white'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='border-amber-500/20 bg-[#1a1a1a] text-white'>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)} className='text-xs focus:bg-amber-500/15 focus:text-amber-400'>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Pagination className='w-auto'>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((p) => p - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-30' : 'text-white/70 hover:text-amber-400'}
                  />
                </PaginationItem>
                {getPageNumbers(currentPage, totalPages).map((page, i) =>
                  page === 'ellipsis' ?
                    <PaginationItem key={`e-${i}`}>
                      <PaginationEllipsis className='text-white/30' />
                    </PaginationItem>
                  : <PaginationItem key={page}>
                      <PaginationLink
                        href='#'
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        className={
                          page === currentPage ?
                            'border-amber-500/50 bg-amber-500/15 text-amber-400'
                          : 'text-white/50 hover:text-amber-400'
                        }
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>,
                )}
                <PaginationItem>
                  <PaginationNext
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                    }}
                    className={
                      currentPage === totalPages ? 'pointer-events-none opacity-30' : 'text-white/70 hover:text-amber-400'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <div className='space-y-6'>
          {paginatedReleases.map((release, index) => {
            const msiUrl = findMsiAsset(release);
            const changelog = getChangelog(release);

            return (
              <div
                key={release.tag_name}
                className='brutal-shadow-sm rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 transition-all duration-200 hover:border-amber-500/40 sm:p-6'
              >
                {/* Header */}
                <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 sm:h-9 sm:w-9'>
                      <GitBranch className='h-4 w-4 text-amber-400' />
                    </div>
                    <div>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h3 className='font-display text-sm font-bold uppercase tracking-tight text-white sm:text-base'>
                          {release.tag_name}
                        </h3>
                        {release.prerelease && (
                          <span className='font-mono-industrial rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400'>
                            Pre-release
                          </span>
                        )}
                      </div>
                      <p className='font-mono-industrial text-[11px] text-white/40'>{formatDate(release.published_at)}</p>
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    {msiUrl && (
                      <a href={msiUrl} target='_blank' rel='noopener noreferrer'>
                        <Button className='brutal-shadow-sm h-7 border border-amber-500/50 bg-amber-500/10 px-2.5 text-[11px] text-white hover:bg-amber-500/20 sm:h-8 sm:px-3 sm:text-xs'>
                          <CloudDownload className='mr-1 h-3 w-3' />
                          MSI
                        </Button>
                      </a>
                    )}
                    <a href={release.html_url} target='_blank' rel='noopener noreferrer'>
                      <Button className='brutal-shadow-sm h-7 border border-white/20 bg-white/5 px-2.5 text-[11px] text-white/70 hover:bg-white/10 sm:h-8 sm:px-3 sm:text-xs'>
                        <ExternalLink className='mr-1 h-3 w-3' />
                        Details
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Changelog */}
                {changelog && (
                  <div className='prose prose-invert max-w-none border-t border-amber-500/10 pt-4'>
                    <div className='markdown-body [&_h2]:font-display [&_h3]:font-display [&_li]:font-mono-industrial [&_p]:font-mono-industrial [&_code]:font-mono-industrial [&_a:hover]:decoration-amber-400 [&_a]:text-amber-400 [&_a]:underline [&_a]:decoration-amber-500/30 [&_code]:mx-0.5 [&_code]:rounded [&_code]:bg-white/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px] [&_code]:text-white/70 [&_h2]:mb-3 [&_h2]:mt-0 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-amber-400 [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-wider [&_h3]:text-white/70 [&_li]:text-xs [&_li]:leading-relaxed [&_li]:text-white/60 [&_p]:text-xs [&_p]:leading-relaxed [&_p]:text-white/60 [&_strong]:font-semibold [&_strong]:text-white/80 [&_ul]:mb-0 [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:pl-4'>
                      <Markdown>{changelog}</Markdown>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-10 flex justify-center'>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((p) => p - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-30' : 'text-white/70 hover:text-amber-400'}
                  />
                </PaginationItem>

                {getPageNumbers(currentPage, totalPages).map((page, i) =>
                  page === 'ellipsis' ?
                    <PaginationItem key={`e-${i}`}>
                      <PaginationEllipsis className='text-white/30' />
                    </PaginationItem>
                  : <PaginationItem key={page}>
                      <PaginationLink
                        href='#'
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        className={
                          page === currentPage ?
                            'border-amber-500/50 bg-amber-500/15 text-amber-400'
                          : 'text-white/50 hover:text-amber-400'
                        }
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>,
                )}

                <PaginationItem>
                  <PaginationNext
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                    }}
                    className={
                      currentPage === totalPages ? 'pointer-events-none opacity-30' : 'text-white/70 hover:text-amber-400'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Release count */}
        <div className='mt-4 text-center'>
          <p className='font-mono-industrial text-[11px] text-white/30'>
            Page {currentPage} of {totalPages} ({releases.length} releases total)
          </p>
        </div>
      </div>
    </div>
  );
}
