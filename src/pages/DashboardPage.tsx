import {
  Archive,
  ArrowRight,
  Barcode,
  CheckCircle,
  Clock,
  Files,
  MagnifyingGlass,
  MapPin,
  Plus,
  UploadSimple,
} from '@phosphor-icons/react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { LinkButton } from '../components/ui/Button';
import { StatCard } from '../components/ui/StatCard';
import { PageHeader } from '../components/ui/PageHeader';
import { dashboardEvents } from '../data/mock';
import { loadRooms } from '../data/roomStore';
import { formatNumber } from '../lib/utils';

const quickActions = [
  { label: 'Create file', detail: 'Register a physical record', to: '/files/new', icon: Plus },
  {
    label: 'Find a record',
    detail: 'Search by number or subject',
    to: '/search',
    icon: MagnifyingGlass,
  },
  { label: 'Issue or return', detail: 'Open the circulation desk', to: '/issue', icon: Barcode },
  {
    label: 'Manage locations',
    detail: 'Add rooms and storage units',
    to: '/admin/locations',
    icon: MapPin,
  },
];

export function DashboardPage() {
  const [rooms] = useState(loadRooms);

  return (
    <div className="space-y-6 lg:space-y-7">
      <PageHeader
        kicker="Record room"
        title="Dashboard"
        description="Your daily view of registered files, physical locations and record-room activity."
        actions={
          <>
            <LinkButton to="/search" variant="ghost" icon={<MagnifyingGlass size={17} />}>
              Find a record
            </LinkButton>
            <LinkButton to="/files/new" icon={<Plus size={17} />}>
              Create file
            </LinkButton>
          </>
        }
      />

      <section
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Registry summary"
      >
        <StatCard
          label="Registered files"
          value={formatNumber(2478450)}
          note="Physical file registry"
          icon={<Files size={21} />}
        />
        <StatCard
          label="Mapped records"
          value="96.8%"
          note="Files with a known shelf"
          icon={<MapPin size={21} />}
          tone="success"
        />
        <StatCard
          label="Currently issued"
          value="148"
          note="12 due back today"
          icon={<Clock size={21} />}
          tone="warning"
        />
        <StatCard
          label="Digitization"
          value="64.2%"
          note="Overall scan progress"
          icon={<Archive size={21} />}
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Quick actions</h2>
            <p className="muted mt-1 text-xs">Common tasks, one click away.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                className="quick-action focus-ring group flex min-h-[106px] items-center gap-3 rounded-2xl border border-base bg-[var(--rr-surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--rr-accent)]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon size={21} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="muted mt-1 block text-xs leading-5">{item.detail}</span>
                </span>
                <ArrowRight
                  size={16}
                  className="muted shrink-0 transition group-hover:translate-x-0.5 group-hover:text-accent"
                />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
        <Card>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Room occupancy</h2>
              <p className="muted mt-1 text-xs">Storage usage for configured record rooms.</p>
            </div>
            <Link
              to="/rooms"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-accent"
            >
              All rooms <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {rooms.map((room) => {
              const percentage = Math.round((room.occupancy / room.capacity) * 100);
              return (
                <Link
                  key={room.id}
                  to={'/rooms/' + room.id}
                  className="block rounded-xl border border-base p-4 transition hover:bg-[var(--rr-surface-2)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        {room.code} · {room.name}
                      </p>
                      <p className="muted mt-1 text-xs">
                        {room.building} · {room.floor} · {room.storageUnits.length} storage units
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{percentage}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--rr-surface-2)]">
                    <div
                      className="h-full rounded-full bg-[var(--rr-accent)]"
                      style={{ width: percentage + '%' }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
          <LinkButton
            to="/admin/locations"
            variant="ghost"
            className="mt-4 w-full"
            icon={<Plus size={16} />}
          >
            Add or edit rooms
          </LinkButton>
        </Card>

        <Card>
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Recent activity</h2>
              <p className="muted mt-1 text-xs">Latest record-room events in the demo data.</p>
            </div>
            <Link
              to="/admin/audit"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-accent"
            >
              Audit log <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-0">
            {dashboardEvents.map((event, index) => (
              <div key={event.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <div className="relative">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    {index === 0 ? (
                      <Barcode size={17} />
                    ) : index === 1 ? (
                      <CheckCircle size={17} />
                    ) : index === 2 ? (
                      <MapPin size={17} />
                    ) : (
                      <MagnifyingGlass size={17} />
                    )}
                  </span>
                  {index < dashboardEvents.length - 1 && (
                    <span className="absolute bottom-[-13px] left-[17px] top-10 w-px bg-[var(--rr-border)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{event.label}</p>
                    <span className="muted text-[10px]">{event.date}</span>
                  </div>
                  <p className="muted mt-1 text-xs leading-5">{event.detail}</p>
                  <p className="mt-1 text-[10px] text-accent">{event.actor}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-base bg-accent-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--rr-surface)] text-accent">
            <UploadSimple size={20} />
          </span>
          <div>
            <p className="text-sm font-semibold">Digital copies and scan batches</p>
            <p className="muted mt-1 text-xs leading-5">
              Open the file registry to attach a copy or review digitization work.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton to="/files" variant="secondary">
            Open files
          </LinkButton>
          <LinkButton to="/digitization" variant="ghost">
            View batches
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
