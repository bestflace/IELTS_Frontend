'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Search, ClipboardCheck, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { DataTable } from '@/components/common/DataTable';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { useApiQuery } from '@/hooks/useApiQuery';
import { safeArray, formatDate } from '@/lib/utils';
import { getTeacherSubmissions } from '@/lib/api/teacher.api';
import type { TeacherSubmission } from '@/types';

function statusBadge(status?: string) {
  if (status === 'REVIEWED') return <Badge tone="success">Đã chấm</Badge>;
  if (status === 'CLAIMED') return <Badge tone="brown">Đang chấm</Badge>;
  return <Badge tone="warning">Chờ chấm</Badge>;
}

export function TeacherSubmissionQueueVietnamese() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const { data, loading, error } = useApiQuery(() => getTeacherSubmissions(status === 'ALL' ? {} : { status }), [status]);
  const items = safeArray<TeacherSubmission>(data).filter((x) => `${x.student?.fullName || x.student?.full_name || x.student?.email || ''}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <PageHeader eyebrow="Chấm bài" title="Hàng đợi bài chấm" description="Danh sách bài Writing/Speaking học viên đã nộp. Giáo viên claim bài, xem chi tiết và gửi nhận xét theo rubric." />
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div><h2 className="font-serif text-2xl font-bold">Danh sách bài nộp</h2><p className="text-sm text-neutralText">Endpoint: <span className="font-mono">/teacher/submissions</span></p></div>
            <div className="relative w-full md:w-80"><Search className="absolute left-3 top-3 h-4 w-4 text-neutralText" /><Input className="pl-9" placeholder="Tìm học viên..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['ALL','PENDING','CLAIMED','REVIEWED'].map((x) => <button key={x} onClick={() => setStatus(x)} className={`rounded-full px-4 py-2 text-sm font-medium ${status === x ? 'bg-moss text-white' : 'bg-paper text-neutralText hover:bg-muted'}`}>{x === 'ALL' ? 'Tất cả' : x === 'PENDING' ? 'Chờ chấm' : x === 'CLAIMED' ? 'Đang chấm' : 'Đã chấm'}</button>)}
          </div>
        </CardHeader>
        <CardContent>
          {loading && <LoadingState />}{error && <ErrorState message={error} />}{!loading && !error && items.length === 0 && <EmptyState title="Chưa có bài cần chấm" description="Khi học viên nộp bài Writing/Speaking, bài sẽ xuất hiện tại đây." />}
          {!loading && !error && items.length > 0 && <DataTable data={items} columns={[
            { header: 'Học viên', cell: (r) => <div><p className="font-semibold text-ink">{r.student?.fullName || r.student?.full_name || r.student?.email || 'Học viên'}</p><p className="text-xs text-neutralText">Attempt: {r.attemptId || '—'}</p></div> },
            { header: 'Kỹ năng', cell: (r) => <Badge tone={r.skill === 'SPEAKING' ? 'brown' : 'sage'}>{r.skill || 'WRITING'}</Badge> },
            { header: 'Trạng thái', cell: (r) => statusBadge(r.status) },
            { header: 'Cập nhật', cell: (r) => formatDate(r.updatedAt) },
            { header: 'Thao tác', cell: (r) => <div className="flex gap-2"><Link href={`/teacher/submissions/${r.id}`}><Button size="sm" variant="outline">Chi tiết</Button></Link><Link href={`/teacher/submissions/${r.id}/${r.skill === 'SPEAKING' ? 'speaking-review' : 'writing-review'}`}><Button size="sm">Chấm bài</Button></Link></div> },
          ]} />}
        </CardContent>
      </Card>
    </div>
  );
}

export function TeacherReportsVietnamese() {
  return (
    <div>
      <PageHeader eyebrow="Báo cáo" title="Báo cáo giáo viên" description="Theo dõi số lượng bài đã chấm, thời gian xử lý và phân bổ kỹ năng Writing/Speaking." />
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Bài đã chấm', '—', ClipboardCheck],
          ['Nhận xét trung bình', '—', MessageCircle],
          ['Thời gian xử lý', '—', ClipboardCheck],
        ].map(([label, value, Icon]) => <Card key={String(label)}><CardContent><Icon className="mb-3 h-5 w-5 text-moss"/><p className="text-xs uppercase tracking-[.18em] text-sage">{String(label)}</p><p className="mt-2 font-serif text-3xl font-bold">{String(value)}</p></CardContent></Card>)}
      </div>
      <div className="mt-5"><EmptyState title="Chưa đủ dữ liệu báo cáo" description="Khi giáo viên chấm bài, biểu đồ và bảng hiệu suất sẽ hiển thị tại đây." /></div>
    </div>
  );
}
