'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addAdminAction, getAdminsAction, removeAdminAction } from '@/lib/actions';
import { tryCatch } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Page() {
  const { user, isSignedIn } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [admins, setAdmins] = useState<string[]>([]);
  const [newAdmin, setNewAdmin] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUserAsync = async () => {
      const admins = await getAdminsAction();
      setIsAdmin(admins.includes(user?.primaryEmailAddress?.emailAddress || ''));
      setAdmins(admins);
    };
    currentUserAsync();
  }, [user?.primaryEmailAddress?.emailAddress]);

  if (!user || !user.primaryEmailAddress)
    return <div className='flex h-screen flex-col items-center justify-center'>Unauthorized</div>;
  if (!isAdmin) return <div className='flex h-screen flex-col items-center justify-center'>Unauthorized</div>;

  return (
    <div className='h-screen w-screen bg-gray-900 p-4 text-white'>
      <div className='mx-auto flex max-w-[800px] flex-col items-center justify-center rounded-lg bg-gray-800 p-4'>
        <h1 className='text-2xl font-bold'>Admin Dashboard</h1>
        <form
          className='mt-4 flex flex-col gap-4'
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const { data: admins, error: getAdminsError } = await tryCatch(getAdminsAction());
            if (getAdminsError) {
              toast.error('Failed to get admins');
              setLoading(false);
              return;
            }
            if (admins.includes(newAdmin)) {
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
          {admins.map((admin) => (
            <li key={admin} className='flex items-center justify-between p-2'>
              <span>{admin}</span>
              <Button
                variant='destructive'
                className='m-2 rounded p-2 text-white'
                onClick={async () => {
                  if (admin === user?.primaryEmailAddress?.emailAddress)
                    return toast.error('You cannot remove yourself as an admin');
                  await removeAdminAction(admin);
                  toast.success(`Removed ${admin} as an admin`);
                }}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
