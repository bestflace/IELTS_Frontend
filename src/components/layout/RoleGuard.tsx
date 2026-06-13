'use client';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import type { AppRole } from '@/types';

export function RoleGuard({ children, allowed }: { children: ReactNode; allowed: AppRole[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, appRole, fetchMe, hydrated } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const allowedKey = useMemo(() => allowed.join(','), [allowed]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!hydrated) return;
      try {
        if (!user) await fetchMe();
      } catch {
        router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      } finally {
        if (mounted) setChecking(false);
      }
    };
    void run();
    return () => { mounted = false; };
  }, [hydrated, user, fetchMe, router, pathname]);

  useEffect(() => {
    if (!checking && appRole && !allowed.includes(appRole)) router.replace('/forbidden');
  }, [checking, appRole, allowedKey, router]);

  if (checking || !user) return <div className="m-6 rounded-2xl border border-line bg-surface p-8 text-sm text-neutralText">Đang kiểm tra phiên đăng nhập...</div>;
  return <>{children}</>;
}
