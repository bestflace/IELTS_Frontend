'use client';
import { Bell, BarChart3, Clock, Save, Settings, Shield, Users, BookOpenCheck } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Badge } from '@/components/common/Badge';
import { EmptyState, ErrorState, LoadingState } from '@/components/common/States';
import { useApiQuery } from '@/hooks/useApiQuery';
import { getAdminConfig } from '@/lib/api/system-config.api';
import { getNotifications } from '@/lib/api/notifications.api';
import { getAdminOverview } from '@/lib/api/reports.api';
import { safeArray, formatDate } from '@/lib/utils';
import type { Notification } from '@/types';

export function SystemConfigVietnamesePage() {
  const { data, loading, error } = useApiQuery(getAdminConfig, []);
  return (
    <div>
      <PageHeader eyebrow="Cài đặt tham số" title="Tham số hệ thống" description="Cho phép thay đổi thời gian làm bài, cấu hình chấm điểm và các feature flag public." actions={<Button><Save className="h-4 w-4" /> Lưu cấu hình</Button>} />
      {loading && <LoadingState />}{error && <ErrorState message={error} />}
      {!loading && !error && <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
        <Card>
          <CardHeader><h2 className="font-serif text-2xl font-bold">Thời gian làm bài</h2><p className="text-sm text-neutralText">Các giá trị này nên map với system config backend.</p></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2"><span className="text-sm font-semibold">Reading</span><Input placeholder="60 phút" /></label>
            <label className="space-y-2"><span className="text-sm font-semibold">Listening</span><Input placeholder="40 phút" /></label>
            <label className="space-y-2"><span className="text-sm font-semibold">Writing</span><Input placeholder="60 phút" /></label>
            <label className="space-y-2"><span className="text-sm font-semibold">Speaking</span><Input placeholder="15 phút" /></label>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-serif text-2xl font-bold">Feature flags</h2></CardHeader>
          <CardContent className="space-y-3 text-sm text-neutralText">
            {['Bật AI grading cho Writing', 'Bật AI grading cho Speaking', 'Cho phép comment trong review', 'Hiển thị blog public'].map((x) => <label key={x} className="flex items-center justify-between rounded-2xl border border-line bg-paper p-3"><span>{x}</span><input type="checkbox" defaultChecked className="h-4 w-4" /></label>)}
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader><h2 className="font-serif text-2xl font-bold">Dữ liệu config hiện tại</h2></CardHeader>
          <CardContent><pre className="max-h-72 overflow-auto rounded-2xl bg-paper p-4 text-xs text-neutralText">{JSON.stringify(data, null, 2)}</pre></CardContent>
        </Card>
      </div>}
    </div>
  );
}

export function ProfileSettingsVietnamesePage({ role = 'admin' }: { role?: 'admin' | 'teacher' }) {
  return (
    <div>
      <PageHeader eyebrow="Cài đặt" title={role === 'teacher' ? 'Cài đặt giáo viên' : 'Cài đặt tài khoản'} description="Cập nhật tên hiển thị, avatar, bio và mật khẩu." actions={<Button><Save className="h-4 w-4" /> Lưu thay đổi</Button>} />
      <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <Card className="paper-texture"><CardContent className="text-center"><div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-moss text-3xl font-bold text-white">A</div><h2 className="mt-4 font-serif text-2xl font-bold">IELTSBF Account</h2><p className="text-sm text-neutralText">Sửa avatar và thông tin cá nhân</p><Button className="mt-5" variant="outline">Tải avatar</Button></CardContent></Card>
        <Card><CardHeader><h2 className="font-serif text-2xl font-bold">Thông tin</h2></CardHeader><CardContent className="space-y-4"><div className="grid gap-4 md:grid-cols-2"><Input placeholder="Tên hiển thị"/><Input placeholder="Số điện thoại"/></div><Textarea placeholder="Bio ngắn..."/><div className="grid gap-4 md:grid-cols-2"><Input type="password" placeholder="Mật khẩu hiện tại"/><Input type="password" placeholder="Mật khẩu mới"/></div></CardContent></Card>
      </div>
    </div>
  );
}

export function NotificationsVietnamesePage() {
  const { data, loading, error } = useApiQuery(() => getNotifications(), []);
  const items = safeArray<Notification>(data);
  return (
    <div>
      <PageHeader eyebrow="Thông báo" title="Trung tâm thông báo" description="Thông báo về lớp học, bài đã được chấm, comment mới và cập nhật hệ thống." />
      <Card><CardHeader><h2 className="font-serif text-2xl font-bold">Danh sách thông báo</h2></CardHeader><CardContent>{loading && <LoadingState />}{error && <ErrorState message={error} />}{!loading && !error && items.length === 0 && <EmptyState title="Chưa có thông báo" />}{!loading && !error && items.length > 0 && <div className="space-y-3">{items.map((n) => <div key={n.id} className="flex gap-3 rounded-2xl border border-line bg-paper p-4"><Bell className="mt-1 h-4 w-4 text-moss"/><div><p className="font-semibold text-ink">{n.title || 'Thông báo'}</p><p className="mt-1 text-sm text-neutralText">{n.message || n.body}</p><p className="mt-2 text-xs text-neutralText">{formatDate(n.createdAt)}</p></div></div>)}</div>}</CardContent></Card>
    </div>
  );
}

export function AdminReportsVietnamesePage() {
  const { data, loading, error } = useApiQuery(getAdminOverview, []);
  const obj = (data && typeof data === 'object' ? data as Record<string, any> : {}) || {};
  return (
    <div>
      <PageHeader eyebrow="Báo cáo" title="Báo cáo tổng quan" description="Tổng hợp số đề thi, số học viên, bài làm, giáo viên và phân bổ điểm." />
      {loading && <LoadingState />}{error && <ErrorState message={error} />}
      {!loading && !error && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{[
        ['Số đề thi', obj.totalTests ?? '—', BookOpenCheck],
        ['Số học viên', obj.totalUsers ?? '—', Users],
        ['Bài đã làm', obj.totalAttempts ?? '—', BarChart3],
        ['Bài chờ chấm', obj.pendingSubmissions ?? '—', Clock],
      ].map(([label, value, Icon]) => <Card key={String(label)}><CardContent><Icon className="mb-3 h-5 w-5 text-moss"/><p className="text-xs uppercase tracking-[.18em] text-sage">{String(label)}</p><p className="mt-2 font-serif text-3xl font-bold">{String(value)}</p></CardContent></Card>)}</div>}
      <div className="mt-5 grid gap-5 xl:grid-cols-2"><Card><CardHeader><h2 className="font-serif text-2xl font-bold">Phân tích đề thi</h2></CardHeader><CardContent><EmptyState title="Chưa đủ dữ liệu" description="Biểu đồ attempts/tests sẽ hiển thị khi backend trả đủ dữ liệu báo cáo." /></CardContent></Card><Card><CardHeader><h2 className="font-serif text-2xl font-bold">Phân bổ band điểm</h2></CardHeader><CardContent><EmptyState title="Chưa đủ dữ liệu" description="Band distribution sẽ được nối với endpoint /admin/reports/bands-distribution." /></CardContent></Card></div>
    </div>
  );
}

export function LearnerProgressVietnamesePage() {
  return (
    <div>
      <PageHeader eyebrow="Tiến độ" title="Báo cáo cá nhân" description="Theo dõi số bài đã làm, band trung bình, tiến độ từng kỹ năng và lịch sử luyện tập." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Bài đã làm', '—', BookOpenCheck],
          ['Band trung bình', '—', BarChart3],
          ['Kỹ năng mạnh', '—', Shield],
          ['Thời gian học', '—', Clock],
        ].map(([label, value, Icon]) => <Card key={String(label)}><CardContent><Icon className="mb-3 h-5 w-5 text-moss"/><p className="text-xs uppercase tracking-[.18em] text-sage">{String(label)}</p><p className="mt-2 font-serif text-3xl font-bold">{String(value)}</p></CardContent></Card>)}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2"><Card><CardHeader><h2 className="font-serif text-2xl font-bold">Tiến độ kỹ năng</h2></CardHeader><CardContent><EmptyState title="Chưa đủ dữ liệu" description="Sau khi làm bài, biểu đồ Reading/Listening/Writing/Speaking sẽ được hiển thị." /></CardContent></Card><Card><CardHeader><h2 className="font-serif text-2xl font-bold">Timeline học tập</h2></CardHeader><CardContent><EmptyState title="Chưa đủ dữ liệu" description="Timeline sẽ dùng endpoint /reports/me/timeline." /></CardContent></Card></div>
    </div>
  );
}
