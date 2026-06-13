'use client';
import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/api/client';
export function useApiQuery<T>(factory:()=>Promise<T>, deps: unknown[] = []) {
  const [data,setData]=useState<T|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  useEffect(()=>{ let alive=true; setLoading(true); setError(null); factory().then(d=>{ if(alive) setData(d);}).catch(e=>{ if(alive) setError(getErrorMessage(e));}).finally(()=>{ if(alive) setLoading(false);}); return ()=>{alive=false}; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return {data,loading,error,setData};
}
