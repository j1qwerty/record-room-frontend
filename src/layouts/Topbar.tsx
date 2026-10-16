import { useState } from 'react';
import { Bell, Check, List, MagnifyingGlass, Moon, Palette, Sun } from '@phosphor-icons/react';
import type { ThemeKey } from './AppShell';

const themeOptions: { id: ThemeKey; label: string; note: string; icon: typeof Sun }[] = [
  { id: 'current', label: 'Current', note: 'Teal and light', icon: Sun },
  { id: 'blue', label: 'Blue', note: 'Blue and light', icon: Palette },
  { id: 'dark', label: 'Dark', note: 'Slate dark mode', icon: Moon },
];

export function Topbar({
  theme,
  setTheme,
  onMenu,
  onOpenCommands,
}: {
  theme: ThemeKey;
  setTheme: (value: ThemeKey) => void;
  onMenu: () => void;
  onOpenCommands: () => void;
}) {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const SelectedThemeIcon = themeOptions.find((option) => option.id === theme)?.icon ?? Sun;

  return (
    <header className="sticky top-0 z-30 flex h-[68px] items-center gap-2 border-b border-base bg-[color-mix(in_srgb,var(--rr-surface)_90%,transparent)] px-3 backdrop-blur-xl sm:gap-3 sm:px-5 md:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="focus-ring rounded-lg p-2 lg:hidden"
        aria-label="Open navigation"
      >
        <List size={22} />
      </button>
      <button
        type="button"
        onClick={onOpenCommands}
        className="focus-ring flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-base bg-[var(--rr-bg)] px-3 py-2.5 text-left sm:max-w-xl sm:gap-3 sm:px-4"
        aria-label="Search everything and open command palette"
      >
        <MagnifyingGlass size={18} className="muted shrink-0" />
        <span className="muted truncate text-sm">Search everything...</span>
        <kbd className="ml-auto hidden shrink-0 rounded-md border border-base bg-[var(--rr-surface)] px-1.5 py-0.5 text-[10px] muted sm:block">
          Ctrl K
        </kbd>
      </button>

      <div className="relative flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => setThemeMenuOpen((open) => !open)}
          className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg px-2.5 hover:bg-[var(--rr-surface-2)] sm:px-3"
          aria-label="Choose appearance"
          aria-expanded={themeMenuOpen}
          aria-haspopup="menu"
          title="Appearance"
        >
          <SelectedThemeIcon size={19} className="text-accent" />
          <span className="hidden text-xs font-semibold sm:inline">Theme</span>
        </button>
        {themeMenuOpen && (
          <div
            className="theme-menu surface absolute right-0 top-12 z-50 w-52 rounded-xl p-1.5"
            role="menu"
            aria-label="Appearance"
          >
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const active = option.id === theme;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setTheme(option.id);
                    setThemeMenuOpen(false);
                  }}
                  className={
                    'focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ' +
                    (active ? 'bg-accent-soft text-accent' : 'hover:bg-[var(--rr-surface-2)]')
                  }
                >
                  <Icon size={18} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="muted block text-[10px]">{option.note}</span>
                  </span>
                  {active && <Check size={16} weight="bold" />}
                </button>
              );
            })}
          </div>
        )}
        <button
          type="button"
          className="focus-ring relative hidden rounded-lg p-2.5 hover:bg-[var(--rr-surface-2)] sm:inline-flex"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[var(--rr-danger)]" />
        </button>
      </div>
    </header>
  );
}
