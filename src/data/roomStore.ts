import type { Room } from '../types';
import { rooms as defaultRooms } from './mock';

const STORAGE_KEY = 'rr-managed-rooms';

export function loadRooms(): Room[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultRooms;
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed)) return parsed as Room[];
  } catch {
    // Fall back to the bundled demonstration locations when storage is unavailable.
  }
  return defaultRooms;
}

export function saveRooms(rooms: Room[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  } catch {
    // Keep the current page usable when browser storage is unavailable or full.
  }
}
