import type { ReactNode } from "react";

type Props = {
  header: ReactNode;
  partTabs?: ReactNode;
  main: ReactNode;
  footer: ReactNode;
};

export function AttemptLayout({ header, partTabs, main, footer }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 text-slate-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-cyan-300/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[480px] w-[480px] rounded-full bg-blue-300/18 blur-3xl"
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {header}
        {partTabs}
        <div className="min-h-0 flex-1">{main}</div>
        {footer}
      </div>
    </div>
  );
}
