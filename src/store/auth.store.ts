"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  login as loginApi,
  logout as logoutApi,
  me as meApi,
} from "@/lib/api/auth.api";
import { tokenStorage } from "@/lib/api/client";
import type { AppRole, User } from "@/types";
import { toAppRole } from "@/types";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  hydrated: boolean;
  appRole?: AppRole;
  setHydrated: () => void;
  setSession: (accessToken: string, user: User) => void;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<AppRole>;
  fetchMe: () => Promise<User | null>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      setSession: (accessToken, user) => {
        tokenStorage.set(accessToken);
        set({ accessToken, user, appRole: toAppRole(user.role) });
      },
      setUser: (user) => set({ user, appRole: toAppRole(user.role) }),
      login: async (email, password) => {
        const res = await loginApi({ email, password });
        tokenStorage.set(res.accessToken);
        const appRole = toAppRole(res.user.role) || "LEARNER";
        set({ accessToken: res.accessToken, user: res.user, appRole });
        return appRole;
      },
      fetchMe: async () => {
        if (!tokenStorage.get()) return null;
        const user = await meApi();
        set({
          user,
          appRole: toAppRole(user.role),
          accessToken: tokenStorage.get(),
        });
        return user;
      },
      logout: async () => {
        try {
          await logoutApi();
        } catch {}
        tokenStorage.clear();
        set({ user: null, accessToken: null, appRole: undefined });
      },
    }),
    {
      name: "ieltsbf-auth",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        appRole: s.appRole,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

export const roleHome = (role?: AppRole) =>
  role === "ADMIN"
    ? "/admin/dashboard"
    : role === "TEACHER"
      ? "/teacher/dashboard"
      : "/learner/dashboard";
