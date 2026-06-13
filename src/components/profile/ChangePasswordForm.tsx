"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { ErrorState } from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import { changePassword } from "@/lib/api/profile.api";

type Props = {
  backHref?: string;
  backLabel?: string;
  accountLabel?: string;
};

export function ChangePasswordForm({
  backHref = "/admin/profile",
  backLabel = "Quay lại hồ sơ",
  accountLabel = "tài khoản",
}: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validate = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return "Vui lòng nhập đầy đủ thông tin đổi mật khẩu.";
    }

    if (newPassword.length < 8) {
      return "Mật khẩu mới nên có ít nhất 8 ký tự.";
    }

    if (newPassword !== confirmPassword) {
      return "Xác nhận mật khẩu mới không khớp.";
    }

    if (currentPassword === newPassword) {
      return "Mật khẩu mới không nên trùng mật khẩu hiện tại.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      setSuccessMessage("");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage("Đã đổi mật khẩu thành công.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside>
        <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50">
              <ShieldCheck className="h-7 w-7 text-cyan-700" />
            </div>

            <h2 className="mt-5 font-serif text-2xl font-black text-slate-950">
              Bảo mật tài khoản
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Cập nhật mật khẩu định kỳ giúp bảo vệ {accountLabel}. Không chia
              sẻ mật khẩu cho người khác.
            </p>

            <Link href={backHref}>
              <Button variant="outline" className="mt-5 w-full">
                <ArrowLeft className="h-4 w-4" />
                {backLabel}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </aside>

      <main>
        {error ? <ErrorState message={error} /> : null}

        <form onSubmit={handleSubmit}>
          <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
            <CardHeader className="relative bg-gradient-to-r from-white/85 via-cyan-50/60 to-blue-50/70">
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Security
              </p>
              <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                Đổi mật khẩu
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật thông tin
                đăng nhập.
              </p>
            </CardHeader>

            <CardContent className="space-y-5">
              {successMessage ? (
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm font-bold text-cyan-700">
                  {successMessage}
                </div>
              ) : null}

              <label className="block space-y-2">
                <span className="text-sm font-bold text-slate-950">
                  Mật khẩu hiện tại
                </span>

                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="pl-9 pr-10"
                    placeholder="Nhập mật khẩu hiện tại"
                  />

                  <button
                    type="button"
                    className="absolute right-3 top-3 text-slate-500"
                    onClick={() => setShowCurrent((value) => !value)}
                  >
                    {showCurrent ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-950">
                    Mật khẩu mới
                  </span>

                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="pr-10"
                      placeholder="Tối thiểu 8 ký tự"
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-3 text-slate-500"
                      onClick={() => setShowNew((value) => !value)}
                    >
                      {showNew ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-950">
                    Xác nhận mật khẩu mới
                  </span>

                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className="pr-10"
                      placeholder="Nhập lại mật khẩu mới"
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-3 text-slate-500"
                      onClick={() => setShowConfirm((value) => !value)}
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>
              </div>

              <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl text-sm leading-6 text-slate-500">
                Mật khẩu nên có ít nhất 8 ký tự, kết hợp chữ hoa, chữ thường, số
                hoặc ký tự đặc biệt để tăng độ an toàn.
              </div>

              <div className="flex justify-end border-t border-cyan-100 pt-5">
                <Button type="submit" disabled={saving}>
                  <KeyRound className="h-4 w-4" />
                  {saving ? "Đang đổi..." : "Đổi mật khẩu"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}
