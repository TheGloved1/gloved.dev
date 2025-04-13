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
    <div className={theme.className}>
      <Button className='fixed right-0 top-0 z-10' onClick={() => setDialogOpen(true)}>
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
