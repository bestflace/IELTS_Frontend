"use client";

import { Headphones, Music2 } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import type { ListeningSet } from "@/types";

type Props = {
  listeningSet: ListeningSet;
};

export function ListeningAudioPanel({ listeningSet }: Props) {
  return (
    <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
      <CardHeader className="relative bg-gradient-to-r from-white/85 via-cyan-50/60 to-blue-50/70">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              Audio panel
            </p>
            <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
              Audio & Transcript
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Kiểm tra file nghe và transcript trước khi xuất bản Listening Set.
            </p>
          </div>

          {listeningSet.audioUrl ? (
            <Badge tone="success">Có audio</Badge>
          ) : (
            <Badge tone="warning">Chưa có audio</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50">
              <Headphones className="h-5 w-5 text-cyan-700" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-black text-slate-950">{listeningSet.title}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {listeningSet.level ? (
                  <Badge tone="brown">Band {listeningSet.level}</Badge>
                ) : null}

                {listeningSet.audioSource ? (
                  <Badge tone="sage">{String(listeningSet.audioSource)}</Badge>
                ) : null}

                <Badge
                  tone={
                    listeningSet.status === "PUBLISHED" ? "success" : "warning"
                  }
                >
                  {listeningSet.status || "DRAFT"}
                </Badge>
              </div>

              {listeningSet.audioUrl ? (
                <>
                  <audio controls className="mt-4 w-full">
                    <source src={listeningSet.audioUrl} />
                    Trình duyệt của bạn không hỗ trợ audio.
                  </audio>

                  <p className="mt-3 break-all font-mono text-xs text-slate-500">
                    {listeningSet.audioUrl}
                  </p>
                </>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-cyan-100 bg-cyan-50/70 p-4 text-sm leading-6 text-amber-700">
                  Chưa có audio URL. Hãy nhập audio URL trong form thông tin bài
                  nghe trước khi xuất bản.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-5">
          <div className="flex items-center gap-2">
            <Music2 className="h-4 w-4 text-cyan-700" />
            <p className="font-serif text-xl font-black text-slate-950">
              Transcript
            </p>
          </div>

          {listeningSet.transcriptText ? (
            <p className="mt-4 max-h-[360px] overflow-auto whitespace-pre-line rounded-2xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-4 text-sm leading-7 text-slate-950">
              {listeningSet.transcriptText}
            </p>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-cyan-100 bg-cyan-50/70 p-4 text-sm leading-6 text-slate-500">
              Chưa có transcript. Transcript không bắt buộc, nhưng nên có để
              giáo viên/admin dễ kiểm tra nội dung nghe.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
