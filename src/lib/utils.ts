import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const safeArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const v = value as Record<string, unknown>;
    if (Array.isArray(v.items)) return v.items as T[];
    if (Array.isArray(v.data)) return v.data as T[];
    if (Array.isArray(v.rows)) return v.rows as T[];
    if (Array.isArray(v.results)) return v.results as T[];
  }
  return [];
};
export const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle:'medium', timeStyle:'short' }).format(new Date(value)) : '—';
export const secondsToClock = (sec?: number | null) => {
  const s = Math.max(0, Number(sec || 0));
  const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const r = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}` : `${m}:${String(r).padStart(2,'0')}`;
};
export const makeId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
