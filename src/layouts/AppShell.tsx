import { Outlet } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ScrollTop } from '../components/ScrollTop';
import { PageTransition } from '../components/PageTransition';
import { CommandPalette } from '../components/CommandPalette';

export type ThemeKey = 'current' | 'blue' | 'dark';

export function AppShell() {
  const [theme, setTheme] = useState<ThemeKey>(() => {
    const saved = localStorage.getItem('rr-theme');
    if (saved === 'blue' || saved === 'dark' || saved === 'current') return saved;
    return localStorage.getItem('rr-dark') === '1' ? 'dark' : 'current';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('rr-theme', theme);
    localStorage.setItem('rr-dark', theme === 'dark' ? '1' : '0');
  }, [theme]);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  return (
    <div className="min-h-dvh bg-[var(--rr-bg)] text-[var(--rr-text)]">
      <div className="flex min-h-dvh">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="min-w-0 flex-1">
          <Topbar
            theme={theme}
            setTheme={setTheme}
            onMenu={() => setMobileOpen(true)}
            onOpenCommands={openPalette}
          />
          <main className="relative">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 page-grid opacity-30" />
            <div className="relative mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-7">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </div>
          </main>
        </div>
      </div>
      <ScrollTop />
      <CommandPalette open={paletteOpen} onOpen={openPalette} onClose={closePalette} />
    </div>
  );
}
