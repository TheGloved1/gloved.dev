import { Models } from '@/lib/ai';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

function getModelName(model: string) {
  return Models.find((m) => m.value === model)?.label ?? model;
}

/**
 * A component that displays a relative timestamp of a given date and updates it at
 * the correct interval to always show the correct relative timestamp.
 *
 * @prop {Date} date - The date to display a relative timestamp for
 * @returns {ReactElement} A React element that displays the relative timestamp
 */
const Timestamp = memo(({ date, model }: { date: Date; model: string }) => {
  const [timestamp, setTimestamp] = useState(createTimestamp(date));
  const [interval, setIntervalState] = useState(calculateInterval(date));

  const updateTimestamp = useCallback(() => {
    setTimestamp(createTimestamp(date));
  }, [date]);

  useEffect(() => {
    let newInterval: NodeJS.Timeout;
    if (interval !== null) {
      newInterval = setInterval(updateTimestamp, interval);
    }
    return () => clearInterval(newInterval);
  }, [interval, updateTimestamp]);

  //Memoize to avoid unnecessary recalculation
  const memoizedInterval = useMemo(() => calculateInterval(date), [date]);
  useEffect(() => {
    setIntervalState(memoizedInterval);
  }, [memoizedInterval]);

  return (
    <span className='text-xs text-neutral-500 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100'>
      <span className='text-xs text-neutral-content opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100'>
        Generated with {getModelName(model)}
      </span>{' '}
      {timestamp}
    </span>
  );
});
Timestamp.displayName = 'Timestamp';

const getSeconds = (date: Date) => Math.floor((new Date().getTime() - date.getTime()) / 1000);

const calculateInterval = (date: Date) => {
  const seconds = getSeconds(date);
  if (seconds < 86400) {
    // Less than a day old
    if (seconds < 60) return 1000; // 1 second
    if (seconds < 3600) return 60000; // 1 minute
    if (seconds < 86400) return 3600000; // 1 hour
  } else {
    return null; // Deactivate interval if over a day old.
  }
};

const createTimestamp = (date: Date) => {
  const seconds = getSeconds(date);
  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) {
    return `${interval} year${interval === 1 ? '' : 's'} ago`;
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return `${interval} month${interval === 1 ? '' : 's'} ago`;
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return `${interval} day${interval === 1 ? '' : 's'} ago`;
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return `${interval} hour${interval === 1 ? '' : 's'} ago`;
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return `${interval} minute${interval === 1 ? '' : 's'} ago`;
  }
  return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
};

export default Timestamp;
