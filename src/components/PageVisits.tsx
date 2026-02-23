'use client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useMount } from '@/hooks/use-mount';
import { getUUID } from '@/lib/actions';
import glovedApi from '@/lib/glovedapi';
import { tryCatch } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

const getVisits = async (visitorId: string | null) => {
  const pageVisits = await glovedApi.trackPageVisit(visitorId || '');
  if (pageVisits.error) throw new Error('Failed to get page visits');
  return pageVisits.data;
};

export function PageVisits(): React.JSX.Element | null {
  const [visitorId, setVisitorId] = useLocalStorage<string | null>('visitorId', null);
  const visitsQuery = useQuery({
    queryKey: ['pageVisits'],
    queryFn: () => getVisits(visitorId),
    initialData: { visitorIds: [], visits: 0 },
  });
  useMount(() => {
    if (visitorId === null) {
      tryCatch(getUUID()).then((result) => {
        if (!result.error) {
          setVisitorId(() => result.data);
        }
      });
    }
  });
  if (visitsQuery.isError) return null;
  if (visitsQuery.isFetching) return null;
  return (
    <div className='fixed bottom-0 left-0 right-0 items-center justify-center gap-4'>
      <div className='text-center text-[0.5rem] sm:text-[0.6rem] md:text-[0.7rem] lg:text-[0.8rem]'>{`This page has been loaded ${visitsQuery.data.visits} times by ${visitsQuery.data.visitorIds.length} visitors`}</div>
    </div>
  );
}
