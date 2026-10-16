import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  Barcode,
  Buildings,
  ChartBar,
  ClipboardText,
  Database,
  Files,
  Gauge,
  Gear,
  MagnifyingGlass,
  MapPin,
  MapTrifold,
  Package,
  Plus,
  Scan,
  ShieldCheck,
  UsersThree,
} from '@phosphor-icons/react';
import { files } from '../data/mock';

type PaletteCommand = {
  id: string;
  title: string;
  description: string;
  group: string;
  terms: string;
  to: string;
  icon: ReactNode;
};

const commands: PaletteCommand[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Overview and daily activity',
    group: 'Navigate',
    terms: 'home overview metrics',
    to: '/',
    icon: <Gauge size={18} />,
  },
  {
    id: 'search',
    title: 'Search records',
    description: 'Find files by number, RF ID or subject',
    group: 'Navigate',
    terms: 'find locate lookup',
    to: '/search',
    icon: <MagnifyingGlass size={18} />,
  },
  {
    id: 'files',
    title: 'File registry',
    description: 'View, upload and move files',
    group: 'Navigate',
    terms: 'records registry documents',
    to: '/files',
    icon: <Files size={18} />,
  },
  {
    id: 'rooms',
    title: 'Record rooms',
    description: 'Browse room maps and shelves',
    group: 'Navigate',
    terms: 'room map shelves almirah location',
    to: '/rooms',
    icon: <MapTrifold size={18} />,
  },
  {
    id: 'barcodes',
    title: 'Barcodes',
    description: 'Print and verify file labels',
    group: 'Navigate',
    terms: 'scan barcode label',
    to: '/barcodes',
    icon: <Barcode size={18} />,
  },
  {
    id: 'digitization',
    title: 'Digitization',
    description: 'Review scanning batches',
    group: 'Navigate',
    terms: 'scan upload ocr batch',
    to: '/digitization',
    icon: <Scan size={18} />,
  },
  {
    id: 'reports',
    title: 'Reports',
    description: 'Open registry reports',
    group: 'Navigate',
    terms: 'analytics export reports',
    to: '/reports',
    icon: <ChartBar size={18} />,
  },
  {
    id: 'users',
    title: 'Users and roles',
    description: 'Manage user access',
    group: 'Navigate',
    terms: 'people permissions roles',
    to: '/admin/users',
    icon: <UsersThree size={18} />,
  },
  {
    id: 'locations',
    title: 'Location designer',
    description: 'Manage rooms and storage units',
    group: 'Navigate',
    terms: 'admin room shelf almirah',
    to: '/admin/locations',
    icon: <Database size={18} />,
  },
  {
    id: 'audit',
    title: 'Audit log',
    description: 'Review record activity',
    group: 'Navigate',
    terms: 'history events movement',
    to: '/admin/audit',
    icon: <ShieldCheck size={18} />,
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Application preferences',
    group: 'Navigate',
    terms: 'theme config preferences',
    to: '/settings',
    icon: <Gear size={18} />,
  },
  {
    id: 'create-file',
    title: 'Create file',
    description: 'Register a physical record',
    group: 'Quick actions',
    terms: 'new add registry record',
    to: '/files/new',
    icon: <Plus size={18} />,
  },
  {
    id: 'add-room',
    title: 'Add room',
    description: 'Create a room in the location designer',
    group: 'Quick actions',
    terms: 'new building physical room',
    to: '/admin/locations?action=add-room',
    icon: <Buildings size={18} />,
  },
  {
    id: 'issue',
    title: 'Issue a file',
    description: 'Open the issue desk',
    group: 'Quick actions',
    terms: 'checkout lend borrow',
    to: '/issue',
    icon: <ClipboardText size={18} />,
  },
  {
    id: 'return',
    title: 'Return a file',
    description: 'Open the return desk',
    group: 'Quick actions',
    terms: 'checkin give back',
    to: '/return',
    icon: <Package size={18} />,
  },
  {
    id: 'move',
    title: 'Move a file',
    description: 'Open file movement workflow',
    group: 'Quick actions',
    terms: 'transfer relocate shelf',
    to: '/movement',
    icon: <MapPin size={18} />,
  },
  {
    id: 'batches',
    title: 'Digitization batches',
    description: 'Open queued scans',
    group: 'Quick actions',
    terms: 'upload scanned documents',
    to: '/digitization',
    icon: <Archive size={18} />,
  },
];

export function CommandPalette({
  open,
  onOpen,
  onClose,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const closePalette = useCallback(() => {
    setQuery('');
    setActiveIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleGlobalKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpen();
      }
      if (event.key === 'Escape' && open) closePalette();
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [open, onOpen, closePalette]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const filtered = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const pageResults = commands.filter((item) => {
      const searchable = (item.title + ' ' + item.description + ' ' + item.terms).toLowerCase();
      return tokens.every((token) => searchable.includes(token));
    });
    if (!open || !query.trim()) return pageResults;

    const fileResults = files
      .filter((file) => {
        const searchable = [
          file.fileNumber,
          file.rfId,
          file.subject,
          file.department,
          String(file.year),
        ]
          .join(' ')
          .toLowerCase();
        return tokens.every((token) => searchable.includes(token));
      })
      .slice(0, 5)
      .map((file) => ({
        id: 'file-' + file.id,
        title: file.fileNumber,
        description: file.subject + ' · ' + file.department,
        group: 'Files',
        terms: file.rfId,
        to: '/files/' + file.id,
        icon: <Files size={18} />,
      }));
    return [...pageResults, ...fileResults];
  }, [open, query]);

  const execute = (command: PaletteCommand) => {
    navigate(command.to);
    closePalette();
  };

  const handleInputKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (filtered.length ? (index + 1) % filtered.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) =>
        filtered.length ? (index + filtered.length - 1) % filtered.length : 0,
      );
    } else if (event.key === 'Enter' && filtered[activeIndex]) {
      event.preventDefault();
      execute(filtered[activeIndex]);
    }
  };

  if (!open) return null;

  const groupNames = Array.from(new Set(filtered.map((item) => item.group)));

  return (
    <div
      className="command-overlay fixed inset-0 z-[100] flex items-start justify-center px-3 pt-[10vh] sm:px-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePalette();
      }}
    >
      <section
        className="command-dialog surface w-full max-w-2xl overflow-hidden rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-title"
      >
        <h2 id="command-title" className="sr-only">
          Search and actions
        </h2>
        <div className="flex items-center gap-3 border-b border-base px-4">
          <MagnifyingGlass size={21} className="muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKey}
            placeholder="Search pages, actions or file numbers..."
            className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--rr-muted)]"
            aria-label="Search pages, actions and files"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="rounded border border-base px-1.5 py-1 text-[10px] muted">ESC</kbd>
        </div>
        <div className="max-h-[min(60vh,30rem)] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <MagnifyingGlass size={25} className="muted mx-auto" />
              <p className="mt-3 text-sm font-semibold">No matching results</p>
              <p className="muted mt-1 text-xs">Try a file number, room, or action.</p>
            </div>
          ) : (
            groupNames.map((group) => (
              <div key={group} className="mb-2 last:mb-0">
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] muted">
                  {group}
                </p>
                {filtered.map((item, index) => {
                  if (item.group !== group) return null;
                  const active = index === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => execute(item)}
                      className={
                        'focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ' +
                        (active ? 'bg-accent-soft text-accent' : 'hover:bg-[var(--rr-surface-2)]')
                      }
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--rr-surface-2)]">
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{item.title}</span>
                        <span className="muted mt-0.5 block truncate text-xs">
                          {item.description}
                        </span>
                      </span>
                      <span className="muted hidden text-[10px] sm:block">Enter ↵</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-base px-4 py-2.5 text-[10px] muted">
          <span>Navigate and run common actions</span>
          <span>↑ ↓ to move · Enter to open</span>
        </footer>
      </section>
    </div>
  );
}
