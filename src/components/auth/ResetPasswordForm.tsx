"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { resetPassword } from "@/lib/api/auth.api";

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  return value;
}

function withNext(path: string, next: string | null) {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score, label: "Yếu" };
  if (score <= 2) return { score, label: "Trung bình" };
  if (score === 3) return { score, label: "Khá" };
  return { score, label: "Mạnh" };
}

const inputClassName =
  "h-12 rounded-2xl border-sky-100 bg-white/80 pl-11 pr-12 text-slate-900 shadow-[0_10px_30px_rgba(14,165,233,0.07)] outline-none transition placeholder:text-slate-400 hover:border-sky-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100/70";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();

  const email = useMemo(() => params.get("email") || "", [params]);
  const code = useMemo(() => params.get("code") || "", [params]);
  const next = useMemo(() => getSafeNext(params.get("next")), [params]);

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(
    () => getPasswordStrength(form.newPassword),
    [form.newPassword],
  );

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.newPassword === form.confirmPassword;

  const loginHref = withNext("/auth/login", next);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !code) {
      toast.error("Thiếu email hoặc mã xác minh. Vui lòng xác minh lại.");
      router.push(withNext("/auth/forgot-password", next));
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        email,
        code,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập.");
      router.push(loginHref);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể đặt lại mật khẩu",
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
            <KeyRound className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-800">Mã đã được xác minh</p>
              <Sparkles className="h-4 w-4 text-cyan-500" />
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Tạo mật khẩu mới đủ mạnh để hoàn tất quá trình khôi phục tài
              khoản.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="reset-new-password"
          className="text-sm font-bold text-slate-700"
        >
          Mật khẩu mới
        </label>

        <div className="relative mt-2">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
          <Input
            id="reset-new-password"
            className={inputClassName}
            type={showNewPassword ? "text" : "password"}
            placeholder="Tối thiểu 6 ký tự"
            value={form.newPassword}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                newPassword: event.target.value,
              }))
            }
            autoComplete="new-password"
            minLength={6}
            required
            disabled={loading}
          />

          <button
            type="button"
            onClick={() => setShowNewPassword((current) => !current)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            aria-label={
              showNewPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"
            }
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {form.newPassword ? (
          <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50/65 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">
                Độ mạnh mật khẩu
              </span>
              <span className="font-bold text-sky-700">{strength.label}</span>
            </div>

            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((segment) => (
                <span
                  key={segment}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    segment <= strength.score
                      ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                      : "bg-sky-100"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="reset-confirm-password"
          className="text-sm font-bold text-slate-700"
        >
          Xác nhận mật khẩu mới
        </label>

        <div className="relative mt-2">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
          <Input
            id="reset-confirm-password"
            className={inputClassName}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu mới"
            value={form.confirmPassword}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }))
            }
            autoComplete="new-password"
            minLength={6}
            required
            disabled={loading}
          />

          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-sky-50 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            aria-label={
              showConfirmPassword
                ? "Ẩn mật khẩu xác nhận"
                : "Hiện mật khẩu xác nhận"
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {form.confirmPassword ? (
          <div
            className={`mt-2 flex items-center gap-2 text-xs font-semibold ${
              passwordsMatch ? "text-emerald-600" : "text-rose-500"
            }`}
          >
            {passwordsMatch ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            {passwordsMatch
              ? "Mật khẩu xác nhận đã khớp"
              : "Mật khẩu xác nhận chưa khớp"}
          </div>
        ) : null}
      </div>

      <Button
        className="group h-12 w-full rounded-2xl border-0 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 font-bold !text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(37,99,235,0.34)] disabled:translate-y-0 disabled:opacity-70"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang cập nhật...
          </>
        ) : (
          <>
            Hoàn tất đặt lại mật khẩu
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-cyan-500" />
        Không sử dụng lại mật khẩu cũ
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
