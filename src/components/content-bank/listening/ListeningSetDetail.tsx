"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Headphones, RefreshCw, Send } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { ListeningSetForm } from "@/components/content-bank/listening/ListeningSetForm";
import { ListeningQuestionManager } from "@/components/content-bank/listening/ListeningQuestionManager";
import {
  getAdminListening,
  publishListening,
  unpublishListening,
} from "@/lib/api/listening.api";
import { getErrorMessage } from "@/lib/api/client";
import type { ListeningSet, PublishStatus } from "@/types";

type Props = {
  setId: string;
};

function statusTone(status?: PublishStatus) {
  if (status === "PUBLISHED") return "success";
  if (status === "ARCHIVED") return "danger";
  return "warning";
}

export function ListeningSetDetail({ setId }: Props) {
  const [listeningSet, setListeningSet] = useState<ListeningSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminListening(setId);
      setListeningSet(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTogglePublish = async () => {
    if (!listeningSet) return;

    setActionLoading(true);
    setError("");

    try {
      if (listeningSet.status === "PUBLISHED") {
        await unpublishListening(listeningSet.id);
      } else {
        await publishListening(listeningSet.id);
      }

      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState label="Đang tải Listening Set..." />;

  if (error && !listeningSet) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  if (!listeningSet) {
    return (
      <EmptyState
        title="Không tìm thấy Listening Set"
        description="Bài nghe có thể đã bị xóa hoặc ID không hợp lệ."
        action={
          <Link href="/admin/listening-sets">
            <Button variant="outline">Quay lại ngân hàng Listening</Button>
          </Link>
        }
      />
    );
  }

  const isPublished = listeningSet.status === "PUBLISHED";
  const questionCount = listeningSet.questions?.length || 0;
  const canPublish = Boolean(listeningSet.audioUrl && questionCount > 0);

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />
      <PageHeader
        eyebrow="Admin / Listening Bank"
        title={listeningSet.title}
        description="Quản lý audio, transcript, câu hỏi, đáp án và trạng thái xuất bản của Listening Set."
        actions={
          <>
            <Link href="/admin/listening-sets">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={loadData}
              disabled={actionLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>

            <Button
              onClick={handleTogglePublish}
              disabled={actionLoading || (!isPublished && !canPublish)}
              variant={isPublished ? "secondary" : "primary"}
            >
              <Send className="h-4 w-4" />
              {isPublished ? "Gỡ xuất bản" : "Xuất bản"}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <main className="min-w-0 space-y-5">
          {error ? <ErrorState message={error} onRetry={loadData} /> : null}

          <ListeningSetForm
            mode="edit"
            initialData={listeningSet}
            onSaved={setListeningSet}
          />

          <ListeningQuestionManager
            listeningSetId={listeningSet.id}
            questions={listeningSet.questions || []}
            isPublished={isPublished}
            onChanged={loadData}
          />
        </main>

        <aside className="grid min-w-0 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
            <CardHeader className="relative bg-gradient-to-r from-white/85 via-cyan-50/60 to-blue-50/70">
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Listening overview
              </p>
              <h2 className="mt-1 font-serif text-xl font-black text-slate-950">
                Thông tin bài nghe
              </h2>
            </CardHeader>

            <CardContent className="min-w-0 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge tone={statusTone(listeningSet.status)}>
                  {listeningSet.status || "DRAFT"}
                </Badge>
                {listeningSet.level ? (
                  <Badge tone="brown">Band {listeningSet.level}</Badge>
                ) : null}
                <Badge tone="sage">{questionCount} câu hỏi</Badge>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">
                  Listening Set ID
                </p>
                <p className="mt-2 break-all font-mono text-xs text-slate-950">
                  {listeningSet.id}
                </p>
              </div>

              {listeningSet.audioUrl ? (
                <div className="rounded-2xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-4">
                  <p className="mb-3 text-sm font-black text-slate-950">
                    Nghe thử
                  </p>
                  <audio controls className="w-full max-w-full">
                    <source src={listeningSet.audioUrl} />
                    Trình duyệt của bạn không hỗ trợ audio.
                  </audio>
                </div>
              ) : null}

              {listeningSet.tags?.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-black text-slate-950">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {listeningSet.tags.map((tag) => (
                      <Badge key={tag.id} tone="sage">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl">
                <Headphones className="h-4 w-4 text-cyan-700" />
              </div>

              <div className="min-w-0">
                <h3 className="font-serif text-xl font-black text-slate-950">
                  Điều kiện xuất bản
                </h3>
                <div className="mt-3 space-y-3 text-sm text-slate-500">
                  <div className="rounded-xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-3">
                    <p className="font-black text-slate-950">1. Có audio</p>
                    <p className="mt-1 text-xs">
                      {listeningSet.audioUrl
                        ? "Đã có audio."
                        : "Chưa có audio."}
                    </p>
                  </div>
                  <div className="rounded-xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-3">
                    <p className="font-black text-slate-950">2. Có câu hỏi</p>
                    <p className="mt-1 text-xs">
                      Hiện có {questionCount} câu hỏi.
                    </p>
                  </div>
                </div>

                {!isPublished && !canPublish ? (
                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                    Chưa thể xuất bản. Hãy thêm audio và ít nhất một câu hỏi.
                  </p>
                ) : null}
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
