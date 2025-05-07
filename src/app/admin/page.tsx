'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdmin } from '@/hooks/use-admin';
import { addAdminAction, deleteSyncAction, removeAdminAction } from '@/lib/actions';
import { tryCatch } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
  const { user } = useUser();
  const admins = useAdmin();
  const [newAdmin, setNewAdmin] = useState('');
  const [loading, setLoading] = useState(false);

  const email = user?.primaryEmailAddress?.emailAddress;

  if (admins.isLoading)
    return (
      <div className='flex h-screen flex-col items-center justify-center'>
        <Loader2 className='animate-spin' />
      </div>
    );

  return (
    <div className='h-screen w-screen bg-gray-900 p-4 text-white'>
      <div className='mx-auto flex max-w-[800px] flex-col items-center justify-center rounded-lg bg-gray-800 p-4'>
        <h1 className='text-2xl font-bold'>Admin Dashboard</h1>
        <form
          className='mt-4 flex flex-col gap-4'
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            if (admins.data.includes(newAdmin)) {
              toast.error('User is already an admin');
              setLoading(false);
              setNewAdmin('');
              return;
            }
            const { error: addAdminError } = await tryCatch(addAdminAction(newAdmin));
            if (addAdminError) return toast.error('Failed to add admin');
            toast.success(`Added ${newAdmin} as an admin`);
            setNewAdmin('');
            setLoading(false);
          }}
        >
          <label className='flex flex-col gap-2'>
            <span>Add new admin:</span>
            <Input
              value={newAdmin}
              onChange={(e) => setNewAdmin(e.target.value)}
              type='email'
              className='rounded p-2'
              placeholder='Email address'
              disabled={loading}
              required
            />
          </label>
          <Button className='rounded p-2 text-white' type='submit' disabled={loading}>
            {loading ?
              <Loader2 className='animate-spin' />
            : 'Add'}
          </Button>
        </form>
        <ul className='mt-4 flex flex-col gap-2'>
          {admins.data.map((admin) => (
            <li key={admin} className='flex items-center justify-between p-2'>
              {email === admin && <span className='text-red-500'>{'You ->'}</span>}
              <span>{admin}</span>
              {email !== admin && (
                <Button
                  variant='destructive'
                  className='m-2 rounded p-2 text-white'
                  onClick={async () => {
                    if (email === admin) return toast.error('You cannot remove yourself as an admin');
                    await removeAdminAction(admin);
                    toast.success(`Removed ${admin} as an admin`);
                  }}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
        {email === 'gloves1229@gmail.com' && (
          <div className='mt-4 flex flex-col gap-4'>
            <h2 className='text-xl font-bold'>Danger Zone</h2>
            <Button
              variant='destructive'
              className='m-2 rounded p-2 text-white'
              onClick={async () => {
                const { error: deleteSyncError } = await tryCatch(deleteSyncAction());
                if (deleteSyncError) {
                  toast.error('Failed to delete all sync data in KV');
                  return;
                }
                toast.success('Deleted all sync data in KV');
              }}
            >
              Delete Sync Data
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
