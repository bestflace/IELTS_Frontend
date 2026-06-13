"use client";

type Props = {
  count?: number;
};

export function NotificationBadge({ count = 0 }: Props) {
  if (!count) return null;

  const display = count > 99 ? "99+" : String(count);

  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
      {display}
    </span>
  );
}
