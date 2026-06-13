'use client';
import { ReactNode } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/common/Button';
import { DataTable } from '@/components/common/DataTable';
import { LoadingState, EmptyState, ErrorState } from '@/components/common/States';
import { useApiQuery } from '@/hooks/useApiQuery';
import { safeArray } from '@/lib/utils';
export function GenericListPage<T extends {id?:string; title?:string; name?:string; status?:string; email?:string; role?:string}>({title,description,query,actions}:{title:string;description?:string;query:()=>Promise<unknown>;actions?:ReactNode}){const {data,loading,error}=useApiQuery(query,[]);const items=safeArray<T>(data);return <><PageHeader title={title} description={description} actions={actions}/>{loading&&<LoadingState/>}{error&&<ErrorState message={error}/>} {!loading&&!error&&items.length===0&&<EmptyState/>}{!loading&&!error&&items.length>0&&<DataTable data={items} columns={[{header:'Tên',cell:r=>r.title||r.name||r.email||r.id||'—'},{header:'Trạng thái',cell:r=>r.status||r.role||'—'},{header:'ID',cell:r=><span className='text-xs text-neutralText'>{r.id}</span>}]} />}</>}
export function ComingSoonPage({title,description}:{title:string;description?:string}){return <><PageHeader title={title} description={description}/><EmptyState title='UI đã được scaffold' description='Trang này đã có route, layout, guard và sẵn sàng nối API/detail form theo payload backend thực tế.'/></>}
