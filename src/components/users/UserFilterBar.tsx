"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/common/Input";
import type { BackendRole, UserStatus } from "@/types";

type Props = {
  keyword: string;
  role: "" | BackendRole;
  status: "" | UserStatus;
  onKeywordChange: (value: string) => void;
  onRoleChange: (value: "" | BackendRole) => void;
  onStatusChange: (value: "" | UserStatus) => void;
};

const roleOptions: Array<{ label: string; value: "" | BackendRole }> = [
  { label: "Tất cả vai trò", value: "" },
  { label: "Học viên", value: "USER" },
  { label: "Giáo viên", value: "TEACHER" },
  { label: "Quản trị viên", value: "ADMIN" },
];

const statusOptions: Array<{ label: string; value: "" | UserStatus }> = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Đã khóa", value: "BLOCKED" },
  { label: "Chờ xác thực", value: "PENDING" },
];

export function UserFilterBar({
  keyword,
  role,
  status,
  onKeywordChange,
  onRoleChange,
  onStatusChange,
}: Props) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
        <Input
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          className="pl-9"
          placeholder="Tìm theo tên hoặc email..."
        />
      </div>

      <select
        value={role}
        onChange={(event) =>
          onRoleChange(event.target.value as "" | BackendRole)
        }
        className="h-11 w-full rounded-xl border border-cyan-100 bg-white/80 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
      >
        {roleOptions.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as "" | UserStatus)
        }
        className="h-11 w-full rounded-xl border border-cyan-100 bg-white/80 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
      >
        {statusOptions.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
