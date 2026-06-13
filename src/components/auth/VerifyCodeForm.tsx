"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Loader2,
  Mail,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { forgotPassword, verifyResetCode } from "@/lib/api/auth.api";

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

export function VerifyCodeForm() {
  const router = useRouter();
  const params = useSearchParams();

  const initialEmail = useMemo(() => params.get("email") || "", [params]);
  const next = useMemo(() => getSafeNext(params.get("next")), [params]);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const loginHref = withNext("/auth/login", next);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();
    const normalizedCode = code.trim();

    if (!normalizedEmail) {
      toast.error("Vui lòng nhập email.");
      return;
    }

    if (normalizedCode.length < 4) {
      toast.error("Vui lòng nhập mã xác minh hợp lệ.");
      return;
    }

    setLoading(true);

    try {
      await verifyResetCode({
        email: normalizedEmail,
        code: normalizedCode,
      });

      toast.success("Xác minh mã thành công.");

      const search = new URLSearchParams({
        email: normalizedEmail,
        code: normalizedCode,
      });

      if (next) {
        search.set("next", next);
      }

      router.push(`/auth/reset-password?${search.toString()}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Mã xác minh không hợp lệ",
      );
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error("Vui lòng nhập email trước khi gửi lại mã.");
      return;
    }

    setResending(true);

    try {
      await forgotPassword({ email: normalizedEmail });
      toast.success("Mã xác minh mới đã được gửi.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể gửi lại mã",
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50/90 via-sky-50/80 to-blue-50/90 p-5 shadow-[0_16px_45px_rgba(14,165,233,0.08)]">
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-blue-300/20 blur-2xl"
        />
        <div className="relative flex gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-800">Kiểm tra hộp thư</p>
              <Sparkles className="h-4 w-4 text-cyan-500" />
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Nhập mã OTP được gửi đến email. Hãy kiểm tra cả thư mục spam nếu
              chưa thấy email từ IELTSBF.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="verify-email"
          className="text-sm font-bold text-slate-700"
        >
          Email nhận mã
        </label>

        <div className="relative mt-2">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
          <Input
            id="verify-email"
            className={inputClassName}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={loading || resending}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="verify-code"
          className="text-sm font-bold text-slate-700"
        >
          Mã xác minh
        </label>

        <div className="relative mt-2">
          <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
          <Input
            id="verify-code"
            className="h-14 rounded-2xl border-sky-100 bg-white/80 pl-11 pr-4 text-center text-xl font-black tracking-[0.45em] text-sky-900 shadow-[0_10px_30px_rgba(14,165,233,0.07)] outline-none transition placeholder:font-normal placeholder:tracking-[0.25em] placeholder:text-slate-300 hover:border-sky-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100/70"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            autoComplete="one-time-code"
            required
            disabled={loading}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">{code.length}/6 chữ số</span>

          <button
            type="button"
            onClick={resendCode}
            disabled={resending || loading}
            className="inline-flex items-center gap-2 font-bold text-sky-600 transition hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            {resending ? "Đang gửi lại..." : "Gửi lại mã"}
          </button>
        </div>
      </div>

      <Button
        className="group h-12 w-full rounded-2xl border-0 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 font-bold !text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(37,99,235,0.34)] disabled:translate-y-0 disabled:opacity-70"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang xác minh...
          </>
        ) : (
          <>
            Xác minh và tiếp tục
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-cyan-500" />
        Không chia sẻ mã OTP với bất kỳ ai
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
