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
import { minutes } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { CloudDownload, Download, ExternalLink, GitBranch, Loader2 } from 'lucide-react';
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

function findExeAsset(release: GitHubRelease): string | null {
  const exe = release.assets.find((a) => a.name.endsWith('.exe') && a.name.includes('x64'));
  return exe?.browser_download_url ?? null;
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
    staleTime: minutes(10),
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
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <Loader2 className='h-5 w-5 animate-spin text-[#fbbf24]' />
          <p className='font-wow-body text-xs text-[#78716c]'>Loading releases...</p>
        </div>
      </div>
    );
  }

  if (releasesQuery.isError) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <div className='rounded-sm border border-[#c41e3a]/30 bg-[#c41e3a]/10 px-6 py-4 text-center'>
          <p className='font-wow-body text-sm text-[#c41e3a]/80'>Failed to load releases. Try again later.</p>
        </div>
      </div>
    );
  }

  if (releases.length === 0) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <p className='font-wow-body text-sm text-[#78716c]'>No releases found.</p>
      </div>
    );
  }

  return (
    <div className='relative py-8 sm:py-12'>
      <div className='mx-auto max-w-4xl'>
        {/* Top pagination bar */}
        {totalPages > 1 && (
          <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-2'>
              <span className='font-wow-body text-xs text-[#78716c]'>Per page</span>
              <Select value={String(releasesPerPage)} onValueChange={(v) => setReleasesPerPage(Number(v))}>
                <SelectTrigger className='h-7 w-16 rounded-sm border-[#3f3a36] bg-[#1c1917] text-xs text-[#a8a29e] transition-all duration-150 hover:border-[#a16207]/50'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='rounded-sm border-[#3f3a36] bg-[#1c1917] text-[#a8a29e]'>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem
                      key={n}
                      value={String(n)}
                      className='text-xs text-[#a8a29e] focus:bg-[#292524] focus:text-[#faf6f0] data-[state=checked]:text-[#fbbf24]'
                    >
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Pagination className='ml-auto mr-0 w-auto justify-end'>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href='#'
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((p) => p - 1);
                    }}
                    className={
                      currentPage === 1 ?
                        'pointer-events-none opacity-20'
                      : 'text-[#a8a29e] transition-all duration-150 hover:text-[#fbbf24]'
                    }
                  />
                </PaginationItem>
                {getPageNumbers(currentPage, totalPages).map((page, i) =>
                  page === 'ellipsis' ?
                    <PaginationItem key={`e-${i}`}>
                      <PaginationEllipsis className='text-[#78716c]' />
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
                            'font-wow-heading border-[#a16207] bg-[#1c1917] text-xs tracking-wide text-[#fbbf24] shadow-[0_0_6px_rgba(251,191,36,0.1)]'
                          : 'text-[#a8a29e] transition-all duration-150 hover:text-[#fbbf24]'
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
                      currentPage === totalPages ?
                        'pointer-events-none opacity-20'
                      : 'text-[#a8a29e] transition-all duration-150 hover:text-[#fbbf24]'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <div className='space-y-4'>
          {paginatedReleases.map((release) => {
            const msiUrl = findMsiAsset(release);
            const exeUrl = findExeAsset(release);

            const changelog = getChangelog(release);

            return (
              <div
                key={release.tag_name}
                className='wow-card group p-4 transition-all duration-150 hover:shadow-[0_0_10px_rgba(161,98,7,0.1)] sm:p-5'
              >
                {/* Header */}
                <div className='mb-3 flex flex-wrap items-start justify-between gap-3'>
                  <div className='flex items-center gap-3'>
                    <div className='relative flex h-9 w-9 items-center justify-center rounded-sm border border-[#3f3a36] bg-[#292524] sm:h-10 sm:w-10'>
                      <div className='pointer-events-none absolute inset-px rounded-sm border border-[#a16207]/20' />
                      <GitBranch className='relative h-4 w-4 text-[#fbbf24]/70 group-hover:text-[#fbbf24] sm:h-[18px] sm:w-[18px]' />
                    </div>
                    <div>
                      <div className='flex flex-wrap items-center gap-2.5'>
                        <h3 className='font-wow-heading text-sm tracking-wide text-[#faf6f0] transition-colors duration-150 group-hover:text-[#fbbf24] sm:text-base'>
                          {release.tag_name}
                        </h3>
                        {release.prerelease && (
                          <span className='font-wow-body rounded-sm border border-[#1eff00]/30 bg-[#1eff00]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#1eff00]'>
                            Pre-release
                          </span>
                        )}
                      </div>
                      <p className='font-wow-body text-[11px] text-[#78716c]'>{formatDate(release.published_at)}</p>
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    {msiUrl && (
                      <a href={msiUrl} target='_blank' rel='noopener noreferrer'>
                        <Button className='h-7 rounded-sm border border-[#3f3a36] bg-[#1c1917] px-2.5 text-[11px] text-[#a8a29e] transition-all duration-150 hover:border-[#a16207] hover:text-[#faf6f0] hover:shadow-[0_0_6px_rgba(161,98,7,0.15)] sm:h-8 sm:px-3 sm:text-xs'>
                          <CloudDownload className='mr-1 h-3 w-3' />
                          MSI
                        </Button>
                      </a>
                    )}
                    {exeUrl && (
                      <a href={exeUrl} target='_blank' rel='noopener noreferrer'>
                        <Button className='h-7 rounded-sm border border-[#3f3a36] bg-[#1c1917] px-2.5 text-[11px] text-[#a8a29e] transition-all duration-150 hover:border-[#a16207] hover:text-[#faf6f0] hover:shadow-[0_0_6px_rgba(161,98,7,0.15)] sm:h-8 sm:px-3 sm:text-xs'>
                          <Download className='mr-1 h-3 w-3' />
                          EXE
                        </Button>
                      </a>
                    )}
                    <a href={release.html_url} target='_blank' rel='noopener noreferrer'>
                      <Button className='h-7 rounded-sm border border-[#3f3a36] bg-[#1c1917] px-2.5 text-[11px] text-[#a8a29e] transition-all duration-150 hover:border-[#a16207] hover:text-[#faf6f0] hover:shadow-[0_0_6px_rgba(161,98,7,0.15)] sm:h-8 sm:px-3 sm:text-xs'>
                        <ExternalLink className='mr-1 h-3 w-3' />
                        Details
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Changelog */}
                {changelog && (
                  <div className='border-t border-[#292524] pt-1.5'>
                    <div className='markdown-body [&_h2]:font-wow-heading [&_h3]:font-wow-heading [&_li]:font-wow-body [&_p]:font-wow-body [&_code]:font-wow-body [&_a:hover]:decoration-[#fbbf24] [&_a]:text-[#fbbf24] [&_a]:underline [&_a]:decoration-[#a16207]/30 [&_code]:mx-0.5 [&_code]:rounded-sm [&_code]:bg-[#292524] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[11px] [&_code]:text-[#a8a29e] [&_h2]:mb-2 [&_h2]:mt-0 [&_h2]:text-sm [&_h2]:tracking-wide [&_h2]:text-[#fbbf24]/80 [&_h3]:mb-1.5 [&_h3]:mt-0.5 [&_h3]:text-xs [&_h3]:tracking-wide [&_h3]:text-[#a8a29e] [&_li]:text-xs [&_li]:leading-relaxed [&_li]:text-[#a8a29e]/80 [&_p]:text-xs [&_p]:leading-relaxed [&_p]:text-[#a8a29e]/80 [&_strong]:font-semibold [&_strong]:text-[#faf6f0]/80 [&_ul]:mb-0 [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:pl-4'>
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
                    className={
                      currentPage === 1 ?
                        'pointer-events-none opacity-20'
                      : 'text-[#a8a29e] transition-all duration-150 hover:text-[#fbbf24]'
                    }
                  />
                </PaginationItem>

                {getPageNumbers(currentPage, totalPages).map((page, i) =>
                  page === 'ellipsis' ?
                    <PaginationItem key={`e-${i}`}>
                      <PaginationEllipsis className='text-[#78716c]' />
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
                            'font-wow-heading border-[#a16207] bg-[#1c1917] text-xs tracking-wide text-[#fbbf24] shadow-[0_0_6px_rgba(251,191,36,0.1)]'
                          : 'text-[#a8a29e] transition-all duration-150 hover:text-[#fbbf24]'
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
                      currentPage === totalPages ?
                        'pointer-events-none opacity-20'
                      : 'text-[#a8a29e] transition-all duration-150 hover:text-[#fbbf24]'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Release count */}
        <div className='mt-4 text-center'>
          <p className='font-wow-body text-xs text-[#78716c]'>
            Page {currentPage} of {totalPages} &middot; {releases.length} release{releases.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>
    </div>
  );
}
