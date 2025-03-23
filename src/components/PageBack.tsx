'use client';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'next-view-transitions';
import { Button } from './ui/button';

export default function PageBack({
  stayTop,
  className,
  noFixed,
  btnClassName,
}: {
  stayTop?: boolean;
  className?: string;
  noFixed?: boolean;
  btnClassName?: string;
}): React.JSX.Element {
  return (
    <Link
      href={'/'}
      onClick={(e) => {
        e.preventDefault();
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = '/';
        }
      }}
      className={
        stayTop ?
          cn(`${noFixed ? '' : 'fixed'} bottom-auto left-2 top-2`, className)
        : cn(`${noFixed ? '' : 'fixed'} bottom-2 left-2 pl-0 md:bottom-auto md:top-2`, className)
      }
    >
      <Button className={btnClassName}>
        <ChevronLeft />
        <span className='hidden p-1 sm:block'>{'Back'}</span>
      </Button>
    </Link>
  );
}
