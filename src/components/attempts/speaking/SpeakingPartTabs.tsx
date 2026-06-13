import { Mic } from "lucide-react";

import { Card } from "@/components/common/Card";

export function SpeakingPartTabs() {
  return (
    <Card className="rounded-[30px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_55px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
          <Mic className="h-4 w-4" />
        </span>
        <div>
          <p className="font-serif text-lg font-black text-slate-950">
            Speaking parts
          </p>
          <p className="text-xs font-semibold text-slate-500">
            Chọn từng part ở thanh điều hướng phía trên.
          </p>
        </div>
      </div>
    </Card>
  );
}
