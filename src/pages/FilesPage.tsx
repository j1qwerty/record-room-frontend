import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowsLeftRight,
  DownloadSimple,
  Eye,
  FileText,
  Funnel,
  MapPin,
  MagnifyingGlass,
  Plus,
  UploadSimple,
  X,
} from '@phosphor-icons/react';
import type { RecordFile } from '../types';
import { files as initialFiles } from '../data/mock';
import { loadRooms } from '../data/roomStore';
import { PageHeader } from '../components/ui/PageHeader';
import { LinkButton, Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

type FileDialog = 'upload' | 'move' | null;

export function FilesPage() {
  const [rooms] = useState(loadRooms);
  const [rows, setRows] = useState<RecordFile[]>(initialFiles);
  const [query, setQuery] = useState('');
  const [dialog, setDialog] = useState<FileDialog>(null);
  const [activeFileId, setActiveFileId] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [digitalCopies, setDigitalCopies] = useState<Record<string, string>>({});
  const [targetRoomId, setTargetRoomId] = useState(rooms[0]?.id ?? '');
  const [targetUnitId, setTargetUnitId] = useState(rooms[0]?.storageUnits[0]?.id ?? '');
  const [targetShelfId, setTargetShelfId] = useState(
    rooms[0]?.storageUnits[0]?.shelves[0]?.id ?? '',
  );
  const [notice, setNotice] = useState('');

  const filteredFiles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((file) =>
      [file.fileNumber, file.rfId, file.subject, file.department, String(file.year), file.location]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }, [query, rows]);

  const activeFile = rows.find((file) => file.id === activeFileId);
  const targetRoom = rooms.find((room) => room.id === targetRoomId) ?? rooms[0];
  const targetUnit =
    targetRoom?.storageUnits.find((unit) => unit.id === targetUnitId) ??
    targetRoom?.storageUnits[0];
  const targetShelf =
    targetUnit?.shelves.find((shelf) => shelf.id === targetShelfId) ?? targetUnit?.shelves[0];

  const openUpload = (fileId: string) => {
    setActiveFileId(fileId);
    setUploadFile(null);
    setDialog('upload');
  };

  const openMove = (fileId: string) => {
    const file = rows.find((item) => item.id === fileId);
    const room = rooms.find((item) => item.id === file?.roomId) ?? rooms[0];
    setActiveFileId(fileId);
    setTargetRoomId(room?.id ?? '');
    setTargetUnitId(room?.storageUnits[0]?.id ?? '');
    setTargetShelfId(room?.storageUnits[0]?.shelves[0]?.id ?? '');
    setDialog('move');
  };

  const saveUpload = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeFile || !uploadFile) return;
    setDigitalCopies((current) => ({ ...current, [activeFile.id]: uploadFile.name }));
    setNotice(
      'Selected digital copy attached to ' + activeFile.fileNumber + ' for this demo session.',
    );
    setDialog(null);
    setUploadFile(null);
  };

  const saveMove = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeFile || !targetRoom || !targetUnit || !targetShelf) return;
    const location =
      targetRoom.building +
      ' / ' +
      targetRoom.floor +
      ' / ' +
      targetRoom.code +
      ' / ' +
      targetUnit.code +
      ' / ' +
      targetShelf.code;
    setRows((current) =>
      current.map((file) =>
        file.id === activeFile.id
          ? {
              ...file,
              location,
              roomId: targetRoom.id,
              almirah: targetUnit.code,
              shelf: targetShelf.code,
              lastMovement: 'Just now',
            }
          : file,
      ),
    );
    setNotice('Moved ' + activeFile.fileNumber + ' to ' + targetShelf.code + '.');
    setDialog(null);
  };

  const exportCsv = () => {
    const quote = (value: string | number) => '"' + String(value).replace(/"/g, '""') + '"';
    const csv = [
      [
        'File number',
        'RF ID',
        'Subject',
        'Department',
        'Year',
        'Status',
        'Location',
        'Digital copy',
      ]
        .map(quote)
        .join(','),
      ...filteredFiles.map((file) =>
        [
          file.fileNumber,
          file.rfId,
          file.subject,
          file.department,
          file.year,
          file.status,
          file.location,
          digitalCopies[file.id] ?? '',
        ]
          .map(quote)
          .join(','),
      ),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'record-room-files.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Registry"
        title="Files"
        description="Find a record, open its details, attach a digital copy or move its physical location."
        actions={
          <>
            <Button variant="ghost" icon={<DownloadSimple size={17} />} onClick={exportCsv}>
              Export CSV
            </Button>
            <LinkButton to="/files/new" icon={<Plus size={17} />}>
              Create file
            </LinkButton>
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

      <Card padding={false} className="min-w-0 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-base p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <label className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-base bg-[var(--rr-bg)] px-3 sm:max-w-md sm:flex-1">
            <MagnifyingGlass size={18} className="muted shrink-0" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search file number, RF ID, subject..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--rr-muted)]"
              aria-label="Search files"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="focus-ring rounded p-1"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </label>
          <div className="flex items-center justify-between gap-3">
            <p className="muted text-xs">
              {filteredFiles.length} of {rows.length} demo files
            </p>
            <Button
              variant="ghost"
              icon={<Funnel size={16} />}
              onClick={() =>
                setNotice(
                  'Search matches file number, RF ID, subject, department, year and current location.',
                )
              }
            >
              Search tips
            </Button>
          </div>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-[var(--rr-bg)] text-[10px] uppercase tracking-[0.12em] muted">
              <tr>
                <th className="px-4 py-3 font-semibold">File</th>
                <th className="px-3 py-3 font-semibold">Department</th>
                <th className="px-3 py-3 font-semibold">Year</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Location</th>
                <th className="px-3 py-3 font-semibold">Digital copy</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rr-border)]">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="align-top transition hover:bg-[var(--rr-bg)]">
                  <td className="max-w-[260px] px-4 py-4">
                    <Link to={'/files/' + file.id} className="font-semibold hover:text-accent">
                      {file.fileNumber}
                    </Link>
                    <p className="muted mt-1 font-mono text-[10px]">{file.rfId}</p>
                    <p className="muted mt-1 line-clamp-2 text-xs">{file.subject}</p>
                  </td>
                  <td className="px-3 py-4 text-xs">{file.department}</td>
                  <td className="px-3 py-4 text-xs tabular-nums">{file.year}</td>
                  <td className="px-3 py-4">
                    <Badge
                      tone={
                        file.status === 'Available'
                          ? 'success'
                          : file.status === 'Issued'
                            ? 'warning'
                            : 'info'
                      }
                    >
                      {file.status}
                    </Badge>
                  </td>
                  <td className="max-w-[225px] px-3 py-4 text-xs leading-5">{file.location}</td>
                  <td className="px-3 py-4">
                    {digitalCopies[file.id] ? (
                      <span className="inline-flex max-w-36 items-center gap-1 text-xs font-medium text-[var(--rr-success)]">
                        <FileText size={15} />{' '}
                        <span className="truncate" title={digitalCopies[file.id]}>
                          {digitalCopies[file.id]}
                        </span>
                      </span>
                    ) : (
                      <span className="muted text-xs">Not attached</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      <LinkButton
                        to={'/files/' + file.id}
                        variant="ghost"
                        icon={<Eye size={15} />}
                        className="min-h-8 px-2 text-xs"
                      >
                        View
                      </LinkButton>
                      <Button
                        variant="ghost"
                        icon={<UploadSimple size={15} />}
                        className="min-h-8 px-2 text-xs"
                        onClick={() => openUpload(file.id)}
                      >
                        Upload
                      </Button>
                      <Button
                        variant="ghost"
                        icon={<ArrowsLeftRight size={15} />}
                        className="min-h-8 px-2 text-xs"
                        onClick={() => openMove(file.id)}
                      >
                        Move
                      </Button>
                      <LinkButton
                        to={'/rooms/' + file.roomId}
                        variant="ghost"
                        icon={<MapPin size={15} />}
                        className="min-h-8 px-2 text-xs"
                      >
                        Map
                      </LinkButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-3 md:hidden">
          {filteredFiles.map((file) => (
            <article key={file.id} className="rounded-xl border border-base p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={'/files/' + file.id}
                    className="break-words text-sm font-semibold hover:text-accent"
                  >
                    {file.fileNumber}
                  </Link>
                  <p className="muted mt-1 break-all font-mono text-[10px]">{file.rfId}</p>
                </div>
                <Badge
                  tone={
                    file.status === 'Available'
                      ? 'success'
                      : file.status === 'Issued'
                        ? 'warning'
                        : 'info'
                  }
                >
                  {file.status}
                </Badge>
              </div>
              <p className="mt-3 text-sm">{file.subject}</p>
              <p className="muted mt-1 text-xs">
                {file.department} · {file.year}
              </p>
              <div className="mt-3 rounded-lg bg-[var(--rr-bg)] p-3">
                <p className="muted text-[10px] font-semibold uppercase tracking-wide">
                  Current location
                </p>
                <p className="mt-1 break-words text-xs leading-5">{file.location}</p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <FileText size={15} className="muted" />
                <span className={digitalCopies[file.id] ? 'text-[var(--rr-success)]' : 'muted'}>
                  {digitalCopies[file.id] ?? 'No digital copy attached'}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <LinkButton
                  to={'/files/' + file.id}
                  variant="ghost"
                  icon={<Eye size={15} />}
                  className="w-full px-2 text-xs"
                >
                  View file
                </LinkButton>
                <Button
                  variant="ghost"
                  icon={<UploadSimple size={15} />}
                  className="w-full px-2 text-xs"
                  onClick={() => openUpload(file.id)}
                >
                  Upload copy
                </Button>
                <Button
                  variant="ghost"
                  icon={<ArrowsLeftRight size={15} />}
                  className="w-full px-2 text-xs"
                  onClick={() => openMove(file.id)}
                >
                  Move file
                </Button>
                <LinkButton
                  to={'/rooms/' + file.roomId}
                  variant="ghost"
                  icon={<MapPin size={15} />}
                  className="w-full px-2 text-xs"
                >
                  View map
                </LinkButton>
              </div>
            </article>
          ))}
          {filteredFiles.length === 0 && (
            <p className="muted py-10 text-center text-sm">No files match this search.</p>
          )}
        </div>

        {filteredFiles.length === 0 && (
          <div className="hidden py-14 text-center md:block">
            <MagnifyingGlass size={25} className="muted mx-auto" />
            <p className="mt-3 text-sm font-semibold">No files found</p>
            <p className="muted mt-1 text-xs">Try another number, subject or department.</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-base px-4 py-3">
          <p className="muted text-xs">Showing {filteredFiles.length} sample records.</p>
          <Link
            to="/search"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent"
          >
            Advanced search <MagnifyingGlass size={14} />
          </Link>
        </div>
      </Card>

      <Modal open={dialog === 'upload'} onClose={() => setDialog(null)} title="Upload digital copy">
        <form onSubmit={saveUpload} className="space-y-4">
          <div>
            <p className="text-sm font-semibold">{activeFile?.fileNumber ?? 'Selected file'}</p>
            <p className="muted mt-1 text-xs">{activeFile?.subject}</p>
          </div>
          <label className="block rounded-xl border border-dashed border-base bg-[var(--rr-bg)] p-5 text-center">
            <UploadSimple size={25} className="text-accent mx-auto" />
            <span className="mt-2 block text-sm font-semibold">Choose a document</span>
            <span className="muted mt-1 block text-xs">PDF or scanned image</span>
            <input
              type="file"
              required
              accept=".pdf,.tif,.tiff,.png,.jpg,.jpeg"
              onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
              className="mt-4 block w-full text-xs"
            />
          </label>
          <p className="muted text-[11px] leading-5">
            This prototype records the selected filename in the current page session. Server-side
            document storage is not connected yet.
          </p>
          <div className="flex flex-col-reverse gap-2 border-t border-base pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button type="submit" icon={<UploadSimple size={16} />} disabled={!uploadFile}>
              Attach copy
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={dialog === 'move'} onClose={() => setDialog(null)} title="Move physical file">
        <form onSubmit={saveMove} className="space-y-4">
          <div>
            <p className="text-sm font-semibold">{activeFile?.fileNumber ?? 'Selected file'}</p>
            <p className="muted mt-1 text-xs">Choose the destination room, almirah and shelf.</p>
          </div>
          <label className="block">
            <span className="text-xs font-semibold">Destination room</span>
            <select
              value={targetRoomId}
              onChange={(event) => {
                const nextRoom = rooms.find((room) => room.id === event.target.value);
                setTargetRoomId(event.target.value);
                setTargetUnitId(nextRoom?.storageUnits[0]?.id ?? '');
                setTargetShelfId(nextRoom?.storageUnits[0]?.shelves[0]?.id ?? '');
              }}
              className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-base bg-[var(--rr-bg)] px-3 text-sm outline-none"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.code} · {room.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold">Almirah / unit</span>
              <select
                value={targetUnit?.id ?? ''}
                onChange={(event) => {
                  const nextUnit = targetRoom?.storageUnits.find(
                    (unit) => unit.id === event.target.value,
                  );
                  setTargetUnitId(event.target.value);
                  setTargetShelfId(nextUnit?.shelves[0]?.id ?? '');
                }}
                className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-base bg-[var(--rr-bg)] px-3 text-sm outline-none"
                disabled={!targetRoom?.storageUnits.length}
              >
                {(targetRoom?.storageUnits ?? []).map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.code} · {unit.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold">Shelf</span>
              <select
                value={targetShelf?.id ?? ''}
                onChange={(event) => setTargetShelfId(event.target.value)}
                className="focus-ring mt-1.5 h-11 w-full rounded-xl border border-base bg-[var(--rr-bg)] px-3 text-sm outline-none"
                disabled={!targetUnit?.shelves.length}
              >
                {(targetUnit?.shelves ?? []).map((shelf) => (
                  <option key={shelf.id} value={shelf.id}>
                    {shelf.code}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {!targetUnit && (
            <p className="rounded-lg bg-[var(--rr-bg)] p-3 text-xs muted">
              This room has no storage units. Add an almirah in Locations before moving a file here.
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 border-t border-base pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button
              type="submit"
              icon={<ArrowsLeftRight size={16} />}
              disabled={!targetRoom || !targetUnit || !targetShelf}
            >
              Confirm move
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
