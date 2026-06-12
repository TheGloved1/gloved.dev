'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdmin } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { api } from '@convex/_generated/api';
import { useMutation } from 'convex/react';
import { Crown, Loader2, Shield, Skull, Trash2, UserMinus, UserPlus } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
  const { user } = useUser();
  const admins = useAdmin();
  const [newAdmin, setNewAdmin] = useState('');
  const [loading, setLoading] = useState(false);
  const addAdmin = useMutation(api.admins.add);
  const removeAdmin = useMutation(api.admins.remove);

  const email = user?.primaryEmailAddress?.emailAddress;

  if (!user) return notFound();

  if (admins.isLoading)
    return (
      <div className='flex h-full flex-col items-center justify-center bg-[#0a0a0a]'>
        <Loader2 className='h-8 w-8 animate-spin text-fuchsia-500' />
      </div>
    );

  return (
    <div className='relative flex h-full flex-col bg-[#0a0a0a] text-white selection:bg-fuchsia-500/30'>
      <div className='grid-pattern pointer-events-none fixed inset-0' />
      <div className='noise-overlay' />

      <div className='mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-hidden px-4 pb-4 pt-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10'>
            <Shield className='h-5 w-5 text-fuchsia-500' />
          </div>
          <div>
            <h1 className='font-display text-xl font-bold uppercase tracking-tight text-white'>Admin</h1>
            <p className='font-mono-industrial text-[10px] text-white/50'>Administrator management panel</p>
          </div>
        </div>

        <div className='shrink-0 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm'>
          <h2 className='font-display mb-3 text-[11px] font-bold uppercase tracking-wide text-white/70'>
            Add Administrator
          </h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              if (admins.data.includes(newAdmin)) {
                toast.error('User is already an admin');
                setLoading(false);
                setNewAdmin('');
                return;
              }
              try {
                await addAdmin({ email: newAdmin });
                toast.success(`Added ${newAdmin} as an admin`);
                setNewAdmin('');
              } catch {
                toast.error('Failed to add admin');
              }
              setLoading(false);
            }}
          >
            <div className='flex gap-2'>
              <Input
                value={newAdmin}
                onChange={(e) => setNewAdmin(e.target.value)}
                type='email'
                className='font-mono-industrial h-8 flex-1 border-white/10 bg-white/5 text-xs text-white placeholder:text-white/30 focus:border-fuchsia-500 focus:bg-fuchsia-500/5'
                placeholder='Email address'
                disabled={loading}
                required
              />
              <Button
                type='submit'
                disabled={loading}
                className='brutal-shadow-sm h-8 border border-fuchsia-500/50 bg-fuchsia-500/10 text-[10px] text-white hover:bg-fuchsia-500/20'
              >
                {loading ?
                  <Loader2 className='h-3 w-3 animate-spin' />
                : <UserPlus className='h-3 w-3' />}
                Add
              </Button>
            </div>
          </form>
        </div>

        <div className='flex min-h-0 flex-1 flex-col rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm'>
          <h2 className='font-display mb-3 shrink-0 text-[11px] font-bold uppercase tracking-wide text-white/70'>
            Current Administrators
          </h2>
          {admins.data.length === 0 ?
            <p className='font-mono-industrial text-sm text-white/30'>No administrators found</p>
          : <ul className='flex-1 space-y-1 overflow-y-auto'>
              {admins.data.map((admin) => (
                <li
                  key={admin}
                  className='flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 transition-colors hover:border-fuchsia-500/30 hover:bg-fuchsia-500/[0.02]'
                >
                  <div className='flex items-center gap-2'>
                    {email === admin && (
                      <span className='font-mono-industrial rounded bg-fuchsia-500/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-fuchsia-400'>
                        You
                      </span>
                    )}
                    {admin === 'gloves1229@gmail.com' ?
                      <span className='font-mono-industrial flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-amber-400'>
                        <Crown className='h-2.5 w-2.5' />
                        Owner
                      </span>
                    : null}
                    <span className='font-mono-industrial text-xs text-white/80'>{admin}</span>
                  </div>
                  {email !== admin && admin !== 'gloves1229@gmail.com' && (
                    <Button
                      variant='destructive'
                      className='brutal-shadow-sm h-7 border-red-500/50 bg-red-500/10 text-[9px] text-red-400 hover:bg-red-500/20'
                      onClick={async () => {
                        try {
                          const result = await removeAdmin({ email: admin });
                          if (!result) return toast.error('Failed to remove admin');
                          toast.success(`Removed ${admin} as an admin`);
                        } catch {
                          toast.error('Failed to remove admin');
                        }
                      }}
                    >
                      <UserMinus className='mr-1 h-2.5 w-2.5' />
                      Banish
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          }
        </div>

        {email === 'gloves1229@gmail.com' && (
          <div className='shrink-0 rounded-xl border border-red-500/20 bg-red-500/[0.03] p-4 backdrop-blur-sm'>
            <div className='flex items-center gap-2'>
              <Skull className='h-4 w-4 text-red-400' />
              <h2 className='font-display text-[11px] font-bold uppercase tracking-wide text-red-400'>Danger Zone</h2>
            </div>
            <p className='font-mono-industrial mt-1 text-[10px] text-white/40'>
              Irreversible actions. Proceed with caution.
            </p>
            <Button
              variant='destructive'
              className='brutal-shadow-sm mt-3 h-7 border-red-500/50 bg-red-500/10 text-[9px] text-red-400 hover:bg-red-500/20'
              onClick={async () => {
                toast.success('Sync data operations are now handled by Convex');
              }}
            >
              <Trash2 className='mr-1 h-3 w-3' />
              Delete Sync Data
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
