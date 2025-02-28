'use client';
import { usePersistentState } from '@/hooks/use-persistent-state';
import { apiRoute } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';

const getVisits = async (visitorId: string | null) => {
  const encodedIp = encodeURIComponent(visitorId || '');
  const pageVisits = await axios.get<{ visitorIds: string[]; visits: number }>(apiRoute(`/page-visits/${encodedIp}`));
  if (!pageVisits.data) throw new Error('Failed to get page visits');
  console.log(pageVisits.data);
  return pageVisits.data;
};

export function PageVisits(): React.JSX.Element | null {
  const [visitorId, setVisitorId] = usePersistentState<string | null>('visitorId', null);
  if (visitorId === null) {
    setVisitorId(crypto.randomUUID());
  }
  const ipQuery = useQuery({
    queryKey: ['pageVisits'],
    queryFn: () => getVisits(visitorId || null),
    initialData: { visitorIds: [], visits: 0 },
  });
  if (ipQuery.isError) return null;
  if (ipQuery.isFetching) return null;
  return (
    <div className='fixed bottom-0 left-0 right-0 items-center justify-center gap-4'>
      <div className='text-center text-[0.5rem] sm:text-[0.6rem] md:text-[0.7rem] lg:text-[0.8rem]'>{`This page has been loaded ${ipQuery.data.visits} times by ${ipQuery.data.visitorIds.length} visitors`}</div>
    </div>
  );
}
