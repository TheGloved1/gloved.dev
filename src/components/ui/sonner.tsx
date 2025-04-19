'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import { usePathname } from 'next/navigation';
import { Toaster as Sonner } from 'sonner';
import { Theme, themes } from '../ThemeChanger';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const pathname = usePathname();
  const [theme] = useLocalStorage<Theme>('theme', themes.cooldark);
  const getLightOrDarkTheme = () => {
    switch (theme.className) {
      case themes.light.className:
        return 'light';
      case themes.dark.className:
        return 'dark';
      case themes.cooldark.className:
        return 'dark';
    }
  };

  return (
    <Sonner
      theme={getLightOrDarkTheme()}
      className={`toaster group ${pathname.includes('/chat') ? theme.className : ''}`}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
