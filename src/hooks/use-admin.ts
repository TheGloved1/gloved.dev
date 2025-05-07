import { getAdminsAction } from '@/lib/actions';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

/**
 * A hook that returns the current user's admin status and the list of admins.
 * @returns An object containing the current user's admin status, the list of admins, and the loading state.
 */
export function useAdmin() {
  const { user } = useUser();
  const adminsQuery = useQuery({
    queryKey: ['admins'],
    queryFn: getAdminsAction,
    initialData: [],
  });

  const isAdmin =
    user?.primaryEmailAddress?.emailAddress ? adminsQuery.data.includes(user.primaryEmailAddress.emailAddress) : false;

  return {
    isAdmin,
    data: adminsQuery.data,
    isLoading: adminsQuery.isLoading,
    error: adminsQuery.error,
  };
}
