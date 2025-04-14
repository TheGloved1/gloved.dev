'use client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { MoonIcon, MoonStarIcon, SunIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export const themes = {
  cooldark: { name: 'Cool Dark', className: 'cool-dark' },
  dark: { name: 'Classic Dark', className: 'dark' },
  light: { name: 'Light', className: 'light' },
} as const;

const renderIcon = (theme: Theme) => {
  switch (theme.className) {
    case 'cool-dark':
      return <MoonStarIcon />;
    case 'dark':
      return <MoonIcon />;
    case 'light':
      return <SunIcon />;
  }
};

export type Theme = (typeof themes)[keyof typeof themes];

export default function ThemeChanger({ children }: { children: React.ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', themes.cooldark);
  return (
    <div
      className={`${theme.className}`}
      style={{
        background: 'hsl(var(--background))',
        color: 'hsl(var(--foreground))',
      }}
    >
      <Button
        className='fixed right-1 top-1 z-10 hidden bg-secondary hover:bg-accent md:block'
        onClick={() => setDialogOpen(true)}
      >
        {renderIcon(theme)}
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Theme</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-2'>
            {Object.values(themes).map((t) => (
              <Button
                key={t.name}
                className='flex items-center justify-between'
                disabled={t.className === theme.className}
                onClick={() => {
                  setTheme(t);
                  setDialogOpen(false);
                }}
              >
                <span className='flex items-center gap-2'>
                  {renderIcon(t)}
                  {t.name}
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      {children}
    </div>
  );
}

export function ThemeChangerButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', themes.cooldark);
  return (
    <>
      <Button
        className='group relative inline-flex size-8 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-foreground/50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
        onClick={() => setDialogOpen(true)}
      >
        {renderIcon(theme)}
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Theme</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-2'>
            {Object.values(themes).map((t) => (
              <Button
                key={t.name}
                className='flex items-center justify-between'
                disabled={t.className === theme.className}
                onClick={() => {
                  setTheme(t);
                  setDialogOpen(false);
                }}
              >
                <span className='flex items-center gap-2'>
                  {renderIcon(t)}
                  {t.name}
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
