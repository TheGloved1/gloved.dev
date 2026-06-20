'use client';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { ChevronLeft, ChevronRight, Crown, Loader2, Shield, UserMinus, UserPlus } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getUsers, toggleAdmin } from './actions';

interface UserItem {
  id: string;
  email: string;
  username: string;
  imageUrl: string;
  isAdmin: boolean;
  isOwner: boolean;
  createdAt: number;
}

export default function Page() {
  const { isLoaded, isSignedIn, user } = useUser();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const isAdmin = user?.publicMetadata?.isAdmin === true;

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !isAdmin) return;
    setFetching(true);
    getUsers(page)
      .then((result) => {
        setUsers(result.users);
        setTotalPages(result.totalPages);
        setTotalCount(result.totalCount);
      })
      .catch(() => toast.error('Failed to fetch users'))
      .finally(() => setFetching(false));
  }, [page, isLoaded, isSignedIn, isAdmin]);

  if (isLoaded && (!isSignedIn || !isAdmin)) return notFound();

  if (!isLoaded) {
    return (
      <div className='flex h-full flex-col items-center justify-center bg-[#0a0a0a]'>
        <Loader2 className='h-8 w-8 animate-spin text-fuchsia-500' />
      </div>
    );
  }

  const handleToggle = async (targetId: string, makeAdmin: boolean) => {
    setToggling(targetId);
    try {
      await toggleAdmin(targetId, makeAdmin);
      setUsers((prev) => prev.map((u) => (u.id === targetId ? { ...u, isAdmin: makeAdmin } : u)));
      toast.success(makeAdmin ? 'Admin added' : 'Admin removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update');
    }
    setToggling(null);
  };

  return (
    <div className='relative flex h-full flex-col bg-[#0a0a0a] text-white selection:bg-fuchsia-500/30'>
      <div className='grid-pattern pointer-events-none fixed inset-0' />
      <div className='noise-overlay' />

      <div className='mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-hidden px-4 pb-4 pt-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10'>
            <Shield className='h-5 w-5 text-fuchsia-500' />
          </div>
          <div>
            <h1 className='font-display text-xl font-bold uppercase tracking-tight text-white'>Admin</h1>
            <p className='font-mono-industrial text-[10px] text-white/50'>User management panel</p>
          </div>
        </div>

        <div className='flex min-h-0 flex-1 flex-col rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm'>
          <h2 className='font-display mb-3 shrink-0 text-[11px] font-bold uppercase tracking-wide text-white/70'>
            All Users {totalCount > 0 && <span className='text-white/40'>({totalCount})</span>}
          </h2>

          {fetching ?
            <div className='flex flex-1 items-center justify-center'>
              <Loader2 className='h-6 w-6 animate-spin text-fuchsia-500' />
            </div>
          : users.length === 0 ?
            <p className='font-mono-industrial flex-1 text-sm text-white/30'>No users found</p>
          : <>
              <ul className='flex-1 space-y-1 overflow-y-auto'>
                {users.map((u) => (
                  <li
                    key={u.id}
                    className='flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 transition-colors hover:border-fuchsia-500/30 hover:bg-fuchsia-500/[0.02]'
                  >
                    <div className='flex min-w-0 items-center gap-3'>
                      <img src={u.imageUrl} alt='' className='h-7 w-7 shrink-0 rounded-full' />
                      <div className='min-w-0'>
                        <div className='flex items-center gap-1.5'>
                          {u.id === user?.id && (
                            <span className='font-mono-industrial rounded bg-fuchsia-500/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-fuchsia-400'>
                              You
                            </span>
                          )}
                          {u.isOwner && (
                            <span className='font-mono-industrial flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-amber-400'>
                              <Crown className='h-2.5 w-2.5' />
                              Owner
                            </span>
                          )}
                          {u.isAdmin && !u.isOwner && (
                            <span className='font-mono-industrial rounded bg-fuchsia-500/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-fuchsia-400'>
                              Admin
                            </span>
                          )}
                        </div>
                        <div className='font-mono-industrial truncate text-xs text-white/80'>{u.username}</div>
                        <div className='font-mono-industrial truncate text-[10px] text-white/40'>{u.email}</div>
                      </div>
                    </div>

                    <div className='ml-4 shrink-0'>
                      {u.id !== user?.id && !u.isOwner ?
                        <Button
                          onClick={() => handleToggle(u.id, !u.isAdmin)}
                          disabled={toggling === u.id}
                          className={`brutal-shadow-sm h-7 border px-2.5 text-[9px] ${
                            u.isAdmin ?
                              'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400 hover:bg-fuchsia-500/20'
                          }`}
                        >
                          {toggling === u.id ?
                            <Loader2 className='h-3 w-3 animate-spin' />
                          : u.isAdmin ?
                            <>
                              <UserMinus className='mr-1 h-2.5 w-2.5' />
                              Demote
                            </>
                          : <>
                              <UserPlus className='mr-1 h-2.5 w-2.5' />
                              Promote
                            </>
                          }
                        </Button>
                      : u.isOwner && u.id === user?.id ?
                        <span className='font-mono-industrial text-[10px] text-white/30'>—</span>
                      : null}
                    </div>
                  </li>
                ))}
              </ul>

              {totalPages > 1 && (
                <div className='mt-3 flex shrink-0 items-center justify-between border-t border-white/10 pt-3'>
                  <span className='font-mono-industrial text-[10px] text-white/40'>
                    Page {page} of {totalPages}
                  </span>
                  <div className='flex gap-2'>
                    <Button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className='brutal-shadow-sm flex h-7 items-center gap-1 border border-white/10 bg-white/5 px-2 text-[10px] text-white/70 hover:bg-white/10 disabled:opacity-30'
                    >
                      <ChevronLeft className='h-3 w-3' />
                      Prev
                    </Button>
                    <Button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className='brutal-shadow-sm flex h-7 items-center gap-1 border border-white/10 bg-white/5 px-2 text-[10px] text-white/70 hover:bg-white/10 disabled:opacity-30'
                    >
                      Next
                      <ChevronRight className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              )}
            </>
          }
        </div>
      </div>
    </div>
  );
}
