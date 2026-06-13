'use client';
import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/api/client';

export function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = async () => {
    setLoading(true); setError(null);
    try { setData(await loader()); } catch (e) { setError(getErrorMessage(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { void reload(); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, loading, error, reload };
}
