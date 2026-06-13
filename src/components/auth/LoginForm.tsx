"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { roleHome, useAuthStore } from "@/store/auth.store";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

function withNext(path: string, next: string | null) {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

const inputClassName =
  "h-12 rounded-2xl border-sky-100 bg-white/80 pl-11 text-slate-900 shadow-[0_10px_30px_rgba(14,165,233,0.07)] outline-none transition placeholder:text-slate-400 hover:border-sky-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100/70";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const params = useSearchParams();
  const login = useAuthStore((state) => state.login);

  const next = useMemo(() => getSafeNext(params.get("next")), [params]);
  const registerHref = withNext("/auth/register", next);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const role = await login(email.trim(), password);
      toast.success("Đăng nhập thành công");
      router.push(next || roleHome(role));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Đăng nhập thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label
          htmlFor="login-email"
          className="text-sm font-bold text-slate-700"
        >
          Email
        </label>
        <div className="relative mt-2">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
          <Input
            id="login-email"
            className={inputClassName}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="login-password"
            className="text-sm font-bold text-slate-700"
          >
            Mật khẩu
          </label>

          <Link
            className="text-sm font-semibold text-sky-600 transition hover:text-cyan-600 hover:underline"
            href="/auth/forgot-password"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <div className="relative mt-2">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
          <Input
            id="login-password"
            className={`${inputClassName} pr-12`}
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-3 text-sm text-slate-500">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-sky-200 accent-cyan-500"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
          disabled={loading}
        />
        Ghi nhớ đăng nhập
      </label>

      <Button
        className="group h-12 w-full rounded-2xl border-0 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 font-bold !text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(37,99,235,0.34)] disabled:translate-y-0 disabled:opacity-70"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang đăng nhập...
          </>
        ) : (
          <>
            Đăng nhập
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-sky-100" />
        </div>
        {/* <div className="relative flex justify-center">
          <span className="bg-white/80 px-3 text-xs font-medium text-slate-400">
            Bắt đầu hành trình mới
          </span>
        </div> */}
      </div>

      <p className="text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <Link
          className="font-bold text-sky-600 transition hover:text-cyan-600 hover:underline"
          href={registerHref}
        >
          Đăng ký miễn phí
        </Link>
      </p>
    </form>
  );
}
