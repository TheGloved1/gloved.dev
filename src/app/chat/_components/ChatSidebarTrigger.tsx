import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function ChatSidebarTrigger() {
  const { open } = useSidebar();
  return (
    <div className='pointer-events-auto fixed left-2 top-2 z-50 flex flex-row content-center items-center justify-center gap-0.5 p-1'>
      <div
        className={
          open ?
            'duration-250 pointer-events-none absolute inset-0 right-auto -z-10 w-8 rounded-md bg-transparent backdrop-blur-sm transition-[background-color,width] delay-0'
          : 'pointer-events-none absolute inset-0 right-auto -z-10 w-[4.65rem] rounded-md bg-sidebar/50 backdrop-blur-sm transition-[background-color,width] delay-150 duration-150'
        }
      ></div>
      <SidebarTrigger
        className={`z-10 inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0`}
      />
      <Link
        href='/chat'
        title='New chat'
        className={
          open ?
            'pointer-events-none inline-flex size-8 -translate-x-[2.125rem] items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium text-muted-foreground opacity-0 transition-[transform,opacity] delay-0 duration-150 hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
          : 'inline-flex size-8 translate-x-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium text-muted-foreground opacity-100 transition-[transform,opacity] delay-150 duration-150 hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
        }
      >
        <Plus width={24} height={24} />
      </Link>
    </div>
  );
}
