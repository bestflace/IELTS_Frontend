'use client';
import Link from 'next/link';
import { BarChart3, BookOpenCheck, CheckCircle2, Clock, FilePlus2, FileStack, GraduationCap, Inbox, Newspaper, Plus, Settings, Sparkles, Tags, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { useApiQuery } from '@/hooks/useApiQuery';
import { safeArray, formatDate } from '@/lib/utils';
import { getAdminOverview } from '@/lib/api/reports.api';
import { getTeacherDashboard, getTeacherSubmissions } from '@/lib/api/teacher.api';
import type { TeacherSubmission } from '@/types';

function Stat({ label, value, icon: Icon, hint }: { label: string; value: string | number; icon: any; hint?: string }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">{label}</p>
          <p className="mt-3 font-serif text-3xl font-bold text-ink">{value}</p>
          {hint && <p className="mt-2 text-xs text-neutralText">{hint}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primarySoft text-moss">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminVietnameseDashboard() {
  const { data, loading, error } = useApiQuery(getAdminOverview, []);
  const obj = (data && typeof data === 'object' ? data as Record<string, any> : {}) || {};
  return (
    <div>
      <PageHeader
        eyebrow="IELTSBF Admin"
        title="Bảng điều khiển"
        description="Tổng quan hệ thống luyện thi IELTS: đề thi, ngân hàng đề, học viên, giáo viên và hoạt động chấm bài."
        actions={<Link href="/admin/tests/new"><Button><Plus className="h-4 w-4" /> Tạo đề thi</Button></Link>}
      />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat label="Tổng đề thi" value={obj.totalTests ?? obj.tests ?? '—'} icon={BookOpenCheck} hint="Đề đã tạo trong hệ thống" />
            <Stat label="Học viên" value={obj.totalUsers ?? obj.users ?? '—'} icon={Users} hint="Tài khoản đang hoạt động" />
            <Stat label="Bài chờ chấm" value={obj.pendingSubmissions ?? '—'} icon={Inbox} hint="Writing/Speaking cần giáo viên xử lý" />
            <Stat label="Ngân hàng đề" value={obj.contentItems ?? '—'} icon={FileStack} hint="Reading, Listening, Writing, Speaking" />
          </div>
          <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
            <Card className="overflow-hidden">
              <CardHeader>
                <h2 className="font-serif text-2xl font-bold">Nghiệp vụ nhanh</h2>
                <p className="mt-1 text-sm text-neutralText">Các nhóm chức năng chính đã được gom lại theo đúng flow quản trị.</p>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Quản lý đề thi', 'Tạo đề thủ công, chọn section từ ngân hàng đề, xem trước và publish.', '/admin/tests', BookOpenCheck],
                  ['Ngân hàng đề', 'Import đề và quản lý từng phần Reading, Listening, Writing, Speaking.', '/admin/reading-sets', FileStack],
                  ['Quản lý người dùng', 'Tìm kiếm tài khoản, đổi quyền, khóa/mở khóa tài khoản.', '/admin/users', Users],
                  ['Cài đặt tham số', 'Điều chỉnh thời gian làm bài và cấu hình public.', '/admin/system-config', Settings],
                ].map(([title, desc, href, Icon]) => (
                  <Link key={String(title)} href={String(href)} className="rounded-2xl border border-line bg-paper p-4 transition hover:border-moss/30 hover:bg-primarySoft/60">
                    <Icon className="mb-3 h-5 w-5 text-moss" />
                    <h3 className="font-serif text-lg font-bold">{String(title)}</h3>
                    <p className="mt-1 text-sm leading-6 text-neutralText">{String(desc)}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
            <Card className="paper-texture">
              <CardHeader>
                <h2 className="font-serif text-2xl font-bold">Gợi ý cải thiện</h2>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutralText">
                <p className="rounded-2xl bg-surface p-3">1. Hoàn thiện backend lớp học để admin tạo lớp và gán giáo viên.</p>
                <p className="rounded-2xl bg-surface p-3">2. Chuẩn hóa import Excel cho từng kỹ năng trong ngân hàng đề.</p>
                <p className="rounded-2xl bg-surface p-3">3. Theo dõi báo cáo band score để biết kỹ năng học viên yếu nhất.</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export function TeacherVietnameseDashboard() {
  const { data, loading, error } = useApiQuery(getTeacherDashboard, []);
  const obj = (data && typeof data === 'object' ? data as Record<string, any> : {}) || {};
  const cards = [
    ['Bài chờ chấm', obj.pending ?? obj.pendingSubmissions ?? '—', Clock],
    ['Đang nhận', obj.claimed ?? '—', FilePlus2],
    ['Đã chấm', obj.reviewed ?? '—', CheckCircle2],
    ['Hiệu suất', obj.performance ?? '—', BarChart3],
  ] as const;
  return (
    <div>
      <PageHeader
        eyebrow="IELTSBF Teacher"
        title="Bảng điều khiển"
        description="Theo dõi hàng đợi bài chấm, bài đã nhận và báo cáo hiệu suất chấm Writing/Speaking."
        actions={<Link href="/teacher/submissions"><Button>Vào hàng đợi chấm</Button></Link>}
      />
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon]) => <Stat key={label} label={label} value={value} icon={Icon} />)}</div>}
      <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <TeacherQueueCompact />
        <Card className="paper-texture">
          <CardHeader>
            <h2 className="font-serif text-2xl font-bold">Quy trình chấm bài</h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutralText">
            {['Mở hàng đợi bài chấm và lọc theo kỹ năng.', 'Claim bài để tránh giáo viên khác chấm trùng.', 'Xem bài làm, transcript/audio và phản hồi AI.', 'Nhập rubric, nhận xét tổng quan và gửi kết quả.'].map((text, index) => (
              <div key={text} className="flex gap-3 rounded-2xl bg-surface p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-moss text-xs font-bold text-white">{index + 1}</span>
                <p>{text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TeacherQueueCompact() {
  const { data, loading, error } = useApiQuery(() => getTeacherSubmissions({ limit: 5, status: 'PENDING' }), []);
  const items = safeArray<TeacherSubmission>(data);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold">Bài mới cần chấm</h2>
          <p className="text-sm text-neutralText">5 bài mới nhất trong hàng đợi.</p>
        </div>
        <Link href="/teacher/submissions" className="text-sm font-semibold text-moss hover:underline">Xem tất cả</Link>
      </CardHeader>
      <CardContent>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {!loading && !error && items.length === 0 && <EmptyState title="Chưa có bài cần chấm" description="Khi học viên nộp Writing/Speaking, bài sẽ xuất hiện tại đây." />}
        {!loading && !error && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <Link key={item.id} href={`/teacher/submissions/${item.id}`} className="flex items-center justify-between rounded-2xl border border-line bg-paper p-4 transition hover:border-moss/30 hover:bg-primarySoft/60">
                <div>
                  <p className="font-semibold text-ink">{item.student?.fullName || item.student?.full_name || item.student?.email || 'Học viên'}</p>
                  <p className="mt-1 text-xs text-neutralText">{item.skill || 'WRITING'} • {formatDate(item.updatedAt)}</p>
                </div>
                <Badge tone="warning">Chờ chấm</Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ComingSoonVietnamese({ title, description, icon: Icon = Sparkles }: { title: string; description?: string; icon?: any }) {
  return (
    <div>
      <PageHeader title={title} description={description || 'Phần này đã có giao diện định hướng và sẽ tiếp tục phát triển khi backend sẵn sàng.'} />
      <Card className="paper-texture flex min-h-[360px] items-center justify-center p-10 text-center">
        <div>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-line bg-surface">
            <Icon className="h-7 w-7 text-moss" />
          </div>
          <h2 className="font-serif text-3xl font-bold">Sẽ phát triển thêm</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutralText">{description || 'Chức năng này đã được đặt đúng vị trí trong menu để demo flow, nhưng phần backend chi tiết sẽ được bổ sung ở giai đoạn sau.'}</p>
        </div>
      </Card>
    </div>
  );
}
