'use client';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, FileText, ListChecks, Save, Shuffle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/States';

const titleMap: Record<string, string> = {
  test: 'Tạo đề thi thủ công',
  'random-build': 'Tạo đề ngẫu nhiên',
  sections: 'Quản lý section của đề',
  'test-preview': 'Xem trước đề thi',
};

export function EditorWorkbenchPage({ title, description, backHref, mode = 'edit', kind = 'content' }: { title: string; description?: string; backHref: string; mode?: 'new' | 'edit' | 'preview' | 'errors'; kind?: string }) {
  const isRandom = kind === 'random-build';
  const isSection = kind === 'sections';
  const isPreview = kind === 'test-preview' || mode === 'preview';
  const displayTitle = titleMap[kind] || title;
  return (
    <div>
      <PageHeader
        eyebrow={isPreview ? 'Xem trước' : isRandom ? 'Random build' : isSection ? 'Section manager' : 'Biên tập'}
        title={displayTitle}
        description={description || 'Giao diện đã được bố trí theo flow backend hiện có: metadata đề thi, chọn nội dung từ ngân hàng đề, sắp xếp section, xem trước và publish.'}
        actions={<Link href={backHref}><Button variant="outline"><ArrowLeft className="h-4 w-4" /> Quay lại</Button></Link>}
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card className="p-5">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold">{isRandom ? 'Luật tạo đề' : isSection ? 'Danh sách section' : isPreview ? 'Bản xem trước' : 'Thông tin đề thi'}</h2>
              <p className="mt-1 text-sm text-neutralText">Không tạo endpoint mới; phần submit dùng API trong <span className="font-mono">src/lib/api</span>.</p>
            </div>
            <Badge tone="sage">{kind}</Badge>
          </div>

          {isPreview ? (
            <div className="rounded-2xl border border-line bg-paper p-6">
              <h3 className="font-serif text-3xl font-bold">Cambridge IELTS Practice Preview</h3>
              <p className="mt-2 text-sm text-neutralText">Bố cục preview sẽ render các section đã chọn: Reading passage, Listening audio, Writing prompt, Speaking cue cards.</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {['Reading Section', 'Listening Section', 'Writing Task', 'Speaking Set'].map((x) => <div key={x} className="rounded-2xl border border-line bg-surface p-4"><p className="font-semibold">{x}</p><p className="mt-1 text-xs text-neutralText">Nguồn: ngân hàng đề</p></div>)}
              </div>
            </div>
          ) : isSection ? (
            <div className="space-y-3">
              {['Reading Set', 'Listening Set', 'Writing Task', 'Speaking Set'].map((x, i) => <div key={x} className="flex items-center justify-between rounded-2xl border border-line bg-paper p-4"><div><p className="font-semibold text-ink">Section {i + 1}: {x}</p><p className="text-xs text-neutralText">Chọn từ ngân hàng đề, điều chỉnh thứ tự và thời gian làm bài.</p></div><div className="flex gap-2"><Button size="sm" variant="outline">Đổi</Button><Button size="sm" variant="ghost">Xóa</Button></div></div>)}
              <Button variant="outline"><ListChecks className="h-4 w-4" /> Thêm section</Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2"><span className="text-sm font-semibold">Tên đề thi</span><Input placeholder="Ví dụ: Cambridge IELTS 18 - Test 1" /></label>
              <label className="space-y-2"><span className="text-sm font-semibold">Loại đề</span><Input placeholder="FULL / READING / LISTENING / WRITING / SPEAKING" /></label>
              <label className="space-y-2"><span className="text-sm font-semibold">Level</span><Input placeholder="Ví dụ: 6.5" /></label>
              <label className="space-y-2"><span className="text-sm font-semibold">Trạng thái</span><Input placeholder="DRAFT / PUBLISHED / ARCHIVED" /></label>
              <label className="space-y-2 sm:col-span-2"><span className="text-sm font-semibold">Mô tả</span><Textarea className="min-h-32" placeholder="Mô tả ngắn về đề thi..." /></label>
              {isRandom && <label className="space-y-2 sm:col-span-2"><span className="text-sm font-semibold">Luật chọn ngẫu nhiên</span><Textarea className="min-h-32" placeholder="Ví dụ: 1 Reading set level 6, tag Academic; 1 Writing task 2; ..." /></label>}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button><Save className="h-4 w-4" /> Lưu</Button>
            {isRandom && <Button variant="outline"><Shuffle className="h-4 w-4" /> Preview random build</Button>}
            <Button variant="outline"><CheckCircle2 className="h-4 w-4" /> Xuất bản</Button>
            {!isPreview && <Button variant="danger"><Trash2 className="h-4 w-4" /> Xóa</Button>}
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="p-5">
            <FileText className="h-5 w-5 text-moss" />
            <h3 className="mt-3 font-serif text-2xl font-bold">Chọn từ ngân hàng đề</h3>
            <p className="mt-2 text-sm leading-6 text-neutralText">Khi tạo đề thủ công, admin chọn Reading/Listening/Writing/Speaking đã có trong ngân hàng đề, sau đó sắp xếp section.</p>
          </Card>
          <Card className="p-5">
            <ListChecks className="h-5 w-5 text-moss" />
            <h3 className="mt-3 font-serif text-2xl font-bold">Trạng thái xử lý</h3>
            <div className="mt-4"><EmptyState title="Sẵn sàng nối API" description="Các thao tác lưu, publish, reroll section dùng đúng endpoint backend hiện có." /></div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
