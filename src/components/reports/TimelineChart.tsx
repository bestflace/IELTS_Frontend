import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/common/Card";

type TimelineItem = {
  label: string;
  date?: string | null;
  band: number;
  skill?: string | null;
  title?: string;
};

function formatDate(value?: string | null) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function TimelineChart({
  data = [],
  children,
}: {
  data?: TimelineItem[];
  children?: React.ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/82 shadow-[0_20px_70px_rgba(14,165,233,0.10)] backdrop-blur-xl">
      <div
        aria-hidden="true"
        className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/18 blur-3xl"
      />

      <CardContent className="relative p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
              Progress timeline
            </p>
            <h2 className="mt-2 font-serif text-2xl font-black text-slate-950">
              Biến động band theo thời gian
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Theo dõi xu hướng điểm số qua các bài đã được chấm.
            </p>
          </div>

          <p className="rounded-full border border-cyan-100 bg-cyan-50/80 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-700">
            {data.length} mốc dữ liệu
          </p>
        </div>

        <div className="mt-6 h-[360px] rounded-3xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/60 p-4">
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#BAE6FD" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 9]}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <Tooltip
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload as
                      | TimelineItem
                      | undefined;
                    return item?.date
                      ? `${item.label} • ${formatDate(item.date)}`
                      : "";
                  }}
                  formatter={(value, _name, payload) => {
                    const item = payload.payload as TimelineItem;
                    return [
                      `${Number(value).toFixed(1).replace(".0", "")} band`,
                      item.title || "Band",
                    ];
                  }}
                  contentStyle={{
                    border: "1px solid rgba(125,211,252,0.7)",
                    borderRadius: 18,
                    boxShadow: "0 18px 45px rgba(14,165,233,0.14)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="band"
                  stroke="#0284C7"
                  strokeWidth={4}
                  dot={{
                    r: 5,
                    strokeWidth: 3,
                    stroke: "#0EA5E9",
                    fill: "#FFFFFF",
                  }}
                  activeDot={{
                    r: 7,
                    strokeWidth: 3,
                    stroke: "#0284C7",
                    fill: "#FFFFFF",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <p className="font-serif text-2xl font-black text-slate-950">
                  Chưa có đủ dữ liệu timeline
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Khi có bài được chấm, xu hướng band sẽ hiển thị ở đây.
                </p>
                {children}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
