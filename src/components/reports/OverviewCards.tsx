import type { ComponentType } from "react";

type OverviewItem = {
  label: string;
  value: string | number;
  suffix?: string;
  helper?: string;
  icon: ComponentType<{ className?: string }>;
  gradient?: string;
};

export function OverviewCards({
  items = [],
  children,
}: {
  items?: OverviewItem[];
  children?: React.ReactNode;
}) {
  if (!items.length) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="group relative overflow-hidden rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_20px_70px_rgba(14,165,233,0.10)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_28px_90px_rgba(14,165,233,0.18)]"
          >
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-300/20 blur-3xl transition group-hover:bg-blue-300/25"
            />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  {item.label}
                </p>

                <p className="mt-4 font-serif text-4xl font-black leading-none text-slate-950">
                  {item.value}
                  {item.suffix ? (
                    <span className="ml-1 text-base font-bold text-slate-500">
                      {item.suffix}
                    </span>
                  ) : null}
                </p>

                {item.helper ? (
                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    {item.helper}
                  </p>
                ) : null}
              </div>

              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${
                  item.gradient || "from-cyan-500 to-blue-600"
                } text-white shadow-[0_16px_35px_rgba(14,165,233,0.25)]`}
              >
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
