'use client';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
export function MultiSelect({children,className,...props}:{children?:ReactNode;className?:string;[key:string]:unknown}){return <div className={cn('rounded-xl border border-line bg-surface p-3 text-sm',className)} {...props}>{children}</div>}
