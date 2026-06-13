'use client';
import { ErrorState } from '@/components/common/States';
export default function Error({error}:{error:Error}){return <main className='p-8'><ErrorState message={error.message}/></main>}
