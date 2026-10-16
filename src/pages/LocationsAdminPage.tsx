import { Buildings, FloppyDisk, Plus, Ruler, Trash, X } from '@phosphor-icons/react';
import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Room, StorageUnit } from '../types';
import { rooms as initialRooms } from '../data/mock';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

const makeShelves = (unitCode: string) =>
  Array.from({ length: 6 }, (_, index) => ({
    id: unitCode + '-S-' + String(index + 1).padStart(2, '0'),
    code: unitCode + '-S-' + String(index + 1).padStart(2, '0'),
    name: 'Shelf ' + (index + 1),
    capacity: 80,
    occupied: 0,
    position: index,
  }));

export function LocationsAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [managedRooms, setManagedRooms] = useState<Room[]>(initialRooms);
  const [selectedRoomId, setSelectedRoomId] = useState(initialRooms[0]?.id ?? '');
  const [showRoomModal, setShowRoomModal] = useState(
    () => searchParams.get('action') === 'add-room',
  );
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [building, setBuilding] = useState('BLD-001');
  const [floor, setFloor] = useState('FL-01');
  const [capacity, setCapacity] = useState('80');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (searchParams.get('action') === 'add-room') setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const room = managedRooms.find((item) => item.id === selectedRoomId) ?? managedRooms[0];

  const createRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = roomName.trim();
    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanName || !cleanCode) return;
    if (managedRooms.some((item) => item.code.toLowerCase() === cleanCode.toLowerCase())) {
      setNotice('That room code already exists.');
      return;
    }

    const newRoom: Room = {
      id: 'room-' + Date.now(),
      code: cleanCode,
      name: cleanName,
      building: building.trim() || 'BLD-001',
      floor: floor.trim() || 'FL-01',
      occupancy: 0,
      capacity: Math.max(1, Number(capacity) || 80),
      status: 'Operational',
      storageUnits: [],
    };
    setManagedRooms((current) => [...current, newRoom]);
    setSelectedRoomId(newRoom.id);
    setShowRoomModal(false);
    setRoomName('');
    setRoomCode('');
    setNotice('Room added. Add a storage unit to start mapping shelves.');
  };

  const addStorageUnit = () => {
    if (!room) {
      setShowRoomModal(true);
      return;
    }
    const latestUnitNumber = managedRooms
      .flatMap((item) => item.storageUnits)
      .reduce((highest, unit) => Math.max(highest, Number(unit.code.match(/\d+/)?.[0] ?? 0)), 0);
    const code = 'A-' + String(latestUnitNumber + 1).padStart(3, '0');
    const unit: StorageUnit = {
      id: 'unit-' + Date.now(),
      code,
      name: 'Almirah ' + (latestUnitNumber + 1),
      type: 'Almirah',
      status: 'Active',
      x: Math.min(8 + (room.storageUnits.length % 4) * 22, 74),
      y: 10,
      width: 18,
      height: 76,
      shelves: makeShelves(code),
    };
    setManagedRooms((current) =>
      current.map((item) =>
        item.id === room.id ? { ...item, storageUnits: [...item.storageUnits, unit] } : item,
      ),
    );
    setNotice(code + ' added to ' + room.name + '.');
  };

  const removeStorageUnit = (unitId: string, unitCode: string) => {
    if (!room || !window.confirm('Remove ' + unitCode + ' from this room?')) return;
    setManagedRooms((current) =>
      current.map((item) =>
        item.id === room.id
          ? { ...item, storageUnits: item.storageUnits.filter((unit) => unit.id !== unitId) }
          : item,
      ),
    );
    setNotice(unitCode + ' removed from the current layout.');
  };

  const saveLayout = () =>
    setNotice('Layout updated in this browser demo. Backend persistence is not connected yet.');

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Physical storage"
        title="Locations"
        description="Create rooms, add almirahs and review shelf layouts."
        actions={
          <>
            <Button
              variant="ghost"
              icon={<Plus size={17} />}
              onClick={addStorageUnit}
              disabled={!room}
            >
              Add unit
            </Button>
            <Button icon={<Plus size={17} />} onClick={() => setShowRoomModal(true)}>
              Add room
            </Button>
            <Button variant="secondary" icon={<FloppyDisk size={17} />} onClick={saveLayout}>
              Save layout
            </Button>
          </>
        }
      />

      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-base bg-accent-soft px-4 py-3 text-sm">
          <p>{notice}</p>
          <button
            type="button"
            onClick={() => setNotice('')}
            className="focus-ring rounded p-1"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Buildings size={18} className="text-accent" />
              <h2 className="text-sm font-semibold">Rooms</h2>
            </div>
            <Badge tone="info">{managedRooms.length}</Badge>
          </div>
          <div className="mt-4 space-y-2">
            {managedRooms.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedRoomId(item.id)}
                aria-pressed={room?.id === item.id}
                className={
                  'focus-ring w-full rounded-xl border p-3 text-left transition ' +
                  (room?.id === item.id
                    ? 'border-[var(--rr-accent)] bg-accent-soft'
                    : 'border-base hover:bg-[var(--rr-surface-2)]')
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{item.code}</p>
                  <span className="muted text-[10px]">{item.storageUnits.length} units</span>
                </div>
                <p className="muted mt-1 text-xs">
                  {item.name} · {item.floor}
                </p>
              </button>
            ))}
            {managedRooms.length === 0 && (
              <p className="muted py-4 text-sm">No rooms yet. Add your first room.</p>
            )}
            <Button
              variant="ghost"
              className="mt-2 w-full"
              icon={<Plus size={16} />}
              onClick={() => setShowRoomModal(true)}
            >
              Add room
            </Button>
          </div>
        </Card>

        <Card padding={false} className="min-w-0 overflow-hidden">
          {room ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base p-4 sm:p-5">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold">{room.name}</h2>
                  <p className="muted mt-1 text-xs">
                    {room.code} · {room.building} · {room.floor}
                  </p>
                </div>
                <Badge tone="info">Layout editor</Badge>
              </div>
              {room.storageUnits.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
                    <Buildings size={23} />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold">No storage units yet</h3>
                  <p className="muted mx-auto mt-1 max-w-sm text-xs leading-5">
                    Add an almirah to start mapping shelves in this room.
                  </p>
                  <Button className="mt-4" icon={<Plus size={16} />} onClick={addStorageUnit}>
                    Add first unit
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 sm:p-5">
                  {room.storageUnits.map((unit) => (
                    <article
                      key={unit.id}
                      className="min-w-0 rounded-xl border border-base bg-[var(--rr-bg)] p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-mono text-xs font-semibold">{unit.code}</p>
                          <p className="mt-1 truncate text-sm">{unit.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStorageUnit(unit.id, unit.code)}
                          className="focus-ring rounded-lg p-1.5 text-[var(--rr-danger)] hover:bg-[var(--rr-surface-2)]"
                          aria-label={'Remove ' + unit.code}
                          title="Remove storage unit"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-6 gap-1">
                        {unit.shelves.map((shelf) => (
                          <div
                            key={shelf.id}
                            className="h-6 rounded border border-base bg-[var(--rr-surface)]"
                            title={shelf.code}
                            aria-label={shelf.code}
                          />
                        ))}
                      </div>
                      <div className="muted mt-4 flex items-center justify-between text-[10px]">
                        <span className="inline-flex items-center gap-1">
                          <Ruler size={12} /> Position
                        </span>
                        <span>
                          x {unit.x}% · y {unit.y}%
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <h2 className="text-sm font-semibold">Add your first room</h2>
              <p className="muted mt-1 text-xs">Rooms hold almirahs, racks and shelf locations.</p>
              <Button
                className="mt-4"
                icon={<Plus size={16} />}
                onClick={() => setShowRoomModal(true)}
              >
                Add room
              </Button>
            </div>
          )}
        </Card>
      </div>

      <Modal open={showRoomModal} onClose={() => setShowRoomModal(false)} title="Add room">
        <form onSubmit={createRoom} className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold">Room name</span>
            <input
              required
              autoFocus
              value={roomName}
              onChange={(event) => setRoomName(event.target.value)}
              placeholder="Record Room 06"
              className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-base bg-[var(--rr-bg)] px-3 text-sm outline-none"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold">Room code</span>
              <input
                required
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value)}
                placeholder="RM-006"
                className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-base bg-[var(--rr-bg)] px-3 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold">Capacity (files)</span>
              <input
                required
                type="number"
                min="1"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-base bg-[var(--rr-bg)] px-3 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold">Building code</span>
              <input
                value={building}
                onChange={(event) => setBuilding(event.target.value)}
                placeholder="BLD-001"
                className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-base bg-[var(--rr-bg)] px-3 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold">Floor code</span>
              <input
                value={floor}
                onChange={(event) => setFloor(event.target.value)}
                placeholder="FL-01"
                className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-base bg-[var(--rr-bg)] px-3 text-sm outline-none"
              />
            </label>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-base pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowRoomModal(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={<Plus size={16} />}>
              Create room
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
