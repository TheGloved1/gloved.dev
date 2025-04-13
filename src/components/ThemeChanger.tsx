'use client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { MoonIcon, MoonStarIcon, SunIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const themes = [
  { name: 'Cool Dark', className: 'cool-dark' },
  { name: 'Classic Dark', className: 'dark' },
  { name: 'Light', className: 'light' },
] as const;

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

type Theme = (typeof themes)[number];

export default function ThemeChanger({ children }: { children: React.ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', themes[0]);
  return (
    <div className={theme.className}>
      <Button className='fixed right-1 top-1 z-10' onClick={() => setDialogOpen(true)}>
        {renderIcon(theme)}
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Theme</DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-2'>
            {themes.map((t) => (
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
