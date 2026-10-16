import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Archive,
  Barcode,
  ChartBar,
  ClipboardText,
  Database,
  Files,
  Gauge,
  Gear,
  MagnifyingGlass,
  MapTrifold,
  Package,
  Scan,
  ShieldCheck,
  SignOut,
  UserCircle,
  UsersThree,
  X,
} from '@phosphor-icons/react';
import { cn } from '../lib/utils';

const groups = [
  {
    title: 'Workspace',
    items: [
      { label: 'Dashboard', to: '/', icon: Gauge },
      { label: 'Search records', to: '/search', icon: MagnifyingGlass },
      { label: 'Files', to: '/files', icon: Files },
      { label: 'Record rooms', to: '/rooms', icon: MapTrifold },
    ],
  },
  {
    title: 'Daily work',
    items: [
      { label: 'Issue desk', to: '/issue', icon: ClipboardText },
      { label: 'Return desk', to: '/return', icon: Package },
      { label: 'Movement log', to: '/movement', icon: Scan },
      { label: 'Barcodes', to: '/barcodes', icon: Barcode },
      { label: 'Digitization', to: '/digitization', icon: Archive },
      { label: 'Reports', to: '/reports', icon: ChartBar },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Locations', to: '/admin/locations', icon: Database },
      { label: 'Users & roles', to: '/admin/users', icon: UsersThree },
      { label: 'Audit log', to: '/admin/audit', icon: ShieldCheck },
      { label: 'Media & content', to: '/admin/media', icon: Files },
      { label: 'Settings', to: '/settings', icon: Gear },
      { label: 'Support', to: '/support', icon: ClipboardText },
    ],
  },
];

const roleNames: Record<string, string> = {
  administrator: 'Administrator',
  'record-room-operator': 'Record room operator',
  'department-user': 'Department user',
  'digitization-operator': 'Digitization operator',
};

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem('rr-role') ?? 'record-room-operator';

  const signOut = () => {
    localStorage.removeItem('rr-role');
    navigate('/login', { replace: true });
    onClose();
  };

  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}
      <aside
        className={cn(
          'app-sidebar fixed inset-y-0 left-0 z-50 flex w-[min(86vw,280px)] flex-col border-r border-base bg-[var(--rr-surface)] transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:w-[252px] lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-base px-4">
          <Link to="/" onClick={onClose} className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--rr-accent)] text-white">
              <Archive size={20} weight="bold" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight">Record Room</span>
              <span className="muted block text-[10px]">File and location management</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="focus-ring rounded-lg p-2 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav
          className="scrollbar-thin flex-1 overflow-y-auto px-3 py-4"
          aria-label="Primary navigation"
        >
          {groups.map((group) => (
            <div key={group.title} className="mb-5">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] muted">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    item.to === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.to);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'focus-ring flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                        active
                          ? 'bg-accent-soft font-semibold text-accent'
                          : 'muted hover:bg-[var(--rr-surface-2)] hover:text-[var(--rr-text)]',
                      )}
                    >
                      <Icon size={18} weight={active ? 'fill' : 'regular'} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-base p-3">
          <div className="flex items-center gap-3 rounded-xl bg-[var(--rr-surface-2)] p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--rr-surface)]">
              <UserCircle size={22} className="text-accent" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">
                {roleNames[role] ?? 'Record room operator'}
              </p>
              <p className="muted mt-0.5 truncate text-[10px]">Demo session</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="focus-ring rounded-lg p-2 muted hover:bg-[var(--rr-surface)] hover:text-[var(--rr-text)]"
              aria-label="Log out"
              title="Log out"
            >
              <SignOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
