import { ReactNode } from "react";

export function MobileSidebar({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-white/65 bg-white/65 p-2 shadow-[0_18px_55px_rgba(14,165,233,0.12)] backdrop-blur-xl">
      {children}
    </div>
  );
}
