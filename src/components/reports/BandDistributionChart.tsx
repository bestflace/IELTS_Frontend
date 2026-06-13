import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/common/Card";

type BandDistributionItem = {
  label: string;
  count: number;
};

export function BandDistributionChart({
  data = [],
  children,
}: {
  data?: BandDistributionItem[];
  children?: React.ReactNode;
}) {
  const hasData = data.some((item) => item.count > 0);

  return (
    <Card className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/82 shadow-[0_20px_70px_rgba(14,165,233,0.10)] backdrop-blur-xl">
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl"
      />

      <CardContent className="relative p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
            Band range
          </p>
          <h2 className="mt-2 font-serif text-2xl font-black text-slate-950">
            Phân phối band
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Tần suất các mức điểm đã đạt trong những lần luyện gần đây.
          </p>
        </div>

        <div className="mt-6 h-[310px] rounded-3xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/60 p-4">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#BAE6FD" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(14,165,233,0.08)" }}
                  contentStyle={{
                    border: "1px solid rgba(125,211,252,0.7)",
                    borderRadius: 18,
                    boxShadow: "0 18px 45px rgba(14,165,233,0.14)",
                  }}
                />
                <Bar dataKey="count" radius={[14, 14, 6, 6]} fill="#0EA5E9" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <p className="font-serif text-2xl font-black text-slate-950">
                  Chưa có band để thống kê
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Hoàn thành và nhận điểm để biểu đồ hiển thị.
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
