"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { register } from "@/lib/api/auth.api";

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
  "h-12 rounded-2xl border-sky-100 bg-white/80 pl-11 text-slate-900 shadow-[0_10px_30px_rgba(14,165,233,0.07)] outline-none transition placeholder:text-slate-400 hover:border-sky-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100/70";

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const next = useMemo(() => getSafeNext(params.get("next")), [params]);
  const loginHref = withNext("/auth/login", next);
  const strength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password],
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!agree) {
      toast.error("Vui lòng đồng ý với điều khoản sử dụng.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      toast.success("Đăng ký thành công. Vui lòng đăng nhập.");
      router.push(loginHref);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="register-full-name"
            className="text-sm font-bold text-slate-700"
          >
            Họ và tên
          </label>
          <div className="relative mt-2">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
            <Input
              id="register-full-name"
              className={inputClassName}
              placeholder="Nguyễn Văn A"
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  fullName: event.target.value,
                }))
              }
              autoComplete="name"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="register-email"
            className="text-sm font-bold text-slate-700"
          >
            Email
          </label>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
            <Input
              id="register-email"
              className={inputClassName}
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="text-sm font-bold text-slate-700"
          >
            Mật khẩu
          </label>
          <div className="relative mt-2">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
            <Input
              id="register-password"
              className={`${inputClassName} pr-12`}
              type={showPassword ? "text" : "password"}
              placeholder="Tối thiểu 6 ký tự"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              autoComplete="new-password"
              minLength={6}
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

        <div>
          <label
            htmlFor="register-confirm-password"
            className="text-sm font-bold text-slate-700"
          >
            Xác nhận mật khẩu
          </label>
          <div className="relative mt-2">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-500" />
            <Input
              id="register-confirm-password"
              className={`${inputClassName} pr-12`}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
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
        </div>
      </div>

      {form.password ? (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/65 p-3">
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

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-transparent p-1 text-sm leading-6 text-slate-500 transition hover:border-sky-100 hover:bg-sky-50/40">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 rounded border-sky-200 accent-cyan-500"
          checked={agree}
          onChange={(event) => setAgree(event.target.checked)}
          disabled={loading}
        />
        <span>
          Tôi đồng ý với Điều khoản sử dụng và cam kết sử dụng nền tảng học tập
          một cách nghiêm túc.
        </span>
      </label>

      <Button
        className="group h-12 w-full rounded-2xl border-0 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 font-bold !text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(37,99,235,0.34)] disabled:translate-y-0 disabled:opacity-70"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tạo tài khoản...
          </>
        ) : (
          <>
            Tạo tài khoản
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Check className="h-4 w-4 text-cyan-500" />
        Miễn phí đăng ký · Không yêu cầu thẻ thanh toán
      </div>

      <p className="text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link
          className="font-bold text-sky-600 transition hover:text-cyan-600 hover:underline"
          href={loginHref}
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
