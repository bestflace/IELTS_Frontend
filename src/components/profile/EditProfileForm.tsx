"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Camera, Mail, RefreshCw, Save, UserRound } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import { getProfile, updateProfile } from "@/lib/api/profile.api";
import type { User } from "@/types";
import { displayName } from "@/types";

function getAvatar(user?: User | null) {
  return user?.avatarUrl || user?.avatar_url || "";
}

export function EditProfileForm() {
  const [profile, setProfile] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const setAuthUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const data = await getProfile();

      setProfile(data);
      setFullName(displayName(data) === data.email ? "" : displayName(data));
      setAvatarUrl(getAvatar(data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên.");
      setSuccessMessage("");
      return;
    }

    if (avatarUrl.trim()) {
      try {
        new URL(avatarUrl.trim());
      } catch {
        setError("Avatar URL không hợp lệ.");
        setSuccessMessage("");
        return;
      }
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const updated = await updateProfile({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim() || null,
      });

      setProfile(updated);
      setAuthUser(updated);
      setFullName(
        displayName(updated) === updated.email ? "" : displayName(updated),
      );
      setAvatarUrl(getAvatar(updated));
      setSuccessMessage("Đã cập nhật hồ sơ thành công.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Đang tải hồ sơ..." />;
  }

  if (error && !profile) {
    return <ErrorState message={error} onRetry={loadProfile} />;
  }

  if (!profile) {
    return (
      <EmptyState
        title="Không tìm thấy hồ sơ"
        description="Không thể tải thông tin tài khoản đang đăng nhập."
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside>
        <ProfileCard user={profile} />
      </aside>

      <main>
        {error ? <ErrorState message={error} onRetry={loadProfile} /> : null}

        <form onSubmit={handleSubmit}>
          <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
            <CardHeader className="relative bg-gradient-to-r from-white/85 via-cyan-50/60 to-blue-50/70">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                    Profile
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                    Thông tin tài khoản
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Cập nhật tên hiển thị và ảnh đại diện của tài khoản đang
                    đăng nhập.
                  </p>
                </div>

                <Button type="button" variant="outline" onClick={loadProfile}>
                  <RefreshCw className="h-4 w-4" />
                  Làm mới
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {successMessage ? (
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-sm font-bold text-cyan-700">
                  {successMessage}
                </div>
              ) : null}

              <AvatarUploader
                value={avatarUrl}
                disabled={saving || uploadingAvatar}
                onChange={setAvatarUrl}
                onError={setError}
                setUploading={setUploadingAvatar}
              />

              <label className="space-y-2 block">
                <span className="text-sm font-bold text-slate-950">Họ tên</span>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <Input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="pl-9"
                    placeholder="Nhập họ tên"
                  />
                </div>
              </label>

              <label className="space-y-2 block">
                <span className="text-sm font-bold text-slate-950">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <Input
                    value={profile.email}
                    readOnly
                    className="pl-9 opacity-70"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Email đăng nhập không được chỉnh sửa tại màn hình này.
                </p>
              </label>

              <label className="space-y-2 block">
                <span className="text-sm font-bold text-slate-950">
                  Avatar URL
                </span>
                <div className="relative">
                  <Camera className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <Input
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    className="pl-9"
                    placeholder="Dán URL ảnh đại diện hoặc upload ảnh phía trên"
                  />
                </div>
              </label>

              <div className="flex justify-end border-t border-cyan-100 pt-5">
                <Button type="submit" disabled={saving || uploadingAvatar}>
                  <Save className="h-4 w-4" />
                  {saving
                    ? "Đang lưu..."
                    : uploadingAvatar
                      ? "Đang upload ảnh..."
                      : "Lưu hồ sơ"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </div>
  );
}
