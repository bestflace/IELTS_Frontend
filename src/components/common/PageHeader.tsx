import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-blue-300/16 blur-3xl"
      />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          {eyebrow ? (
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-3 py-1.5 text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              <Sparkles className="h-3.5 w-3.5" />
              {eyebrow}
            </p>
          ) : null}

          <h1 className="font-serif text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
            {title}
          </h1>

          {description ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              {description}
            </p>
          ) : null}
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
