"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mail,
  MailCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { forgotPassword } from "@/lib/api/auth.api";

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

export function ForgotPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const next = useMemo(() => getSafeNext(params.get("next")), [params]);
  const loginHref = withNext("/auth/login", next);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error("Vui lòng nhập email đã đăng ký.");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword({ email: normalizedEmail });
      toast.success("Mã xác minh đã được gửi đến email của bạn.");

      const search = new URLSearchParams({ email: normalizedEmail });
      if (next) {
        search.set("next", next);
      }

      router.push(`/auth/verify-code?${search.toString()}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể gửi mã xác minh",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50/90 via-sky-50/80 to-blue-50/90 p-5 shadow-[0_16px_45px_rgba(14,165,233,0.08)]">
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl"
        />
        <div className="relative flex gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <MailCheck className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-800">Nhận mã qua email</p>
              <Sparkles className="h-4 w-4 text-cyan-500" />
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Nếu email tồn tại trong hệ thống, IELTSBF sẽ gửi mã xác minh để
              bạn đặt lại mật khẩu.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="forgot-password-email"
          className="text-sm font-bold text-slate-700"
        >
          Email đã đăng ký
        </label>

        <div className="relative mt-2">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
          <Input
            id="forgot-password-email"
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

      <Button
        className="group h-12 w-full rounded-2xl border-0 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 font-bold !text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(37,99,235,0.34)] disabled:translate-y-0 disabled:opacity-70"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang gửi mã...
          </>
        ) : (
          <>
            Gửi mã xác minh
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-cyan-500" />
        Mã xác minh sẽ hết hạn sau một khoảng thời gian
      </div>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-sky-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white/80 px-3 text-xs font-medium text-slate-400">
            Đã nhớ mật khẩu?
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-slate-500">
        <Link
          className="inline-flex items-center gap-2 font-bold text-sky-600 transition hover:text-cyan-600 hover:underline"
          href={loginHref}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại đăng nhập
        </Link>
      </p>
    </form>
  );
}
