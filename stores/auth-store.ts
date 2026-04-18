import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api/client";
import type { User, LoginResponse } from "@/lib/api/types";

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: true,

      login: async (email: string, password: string) => {
        const res = await api.post<LoginResponse>("/api/v1/auth/login", {
          email,
          password,
        });
        set({
          user: res.user,
          token: res.token,
          refreshToken: res.refresh_token ?? null,
          isLoading: false,
        });
      },

      logout: async () => {
        try {
          await api.post("/api/v1/auth/logout");
        } catch {
          // Token may already be invalid
        }
        set({ user: null, token: null, refreshToken: null, isLoading: false });
      },

      setTokens: (token: string, refreshToken: string) => {
        set({ token, refreshToken });
      },

      setUser: (user: User) => set({ user }),

      hydrate: async () => {
        const token = get().token;
        if (!token) {
          set({ isLoading: false });
          return;
        }
        try {
          const user = await api.get<User>("/api/v1/auth/me");
          set({ user, isLoading: false });
        } catch {
          set({ user: null, token: null, refreshToken: null, isLoading: false });
        }
      },
    }),
    {
      name: "ktp-auth",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
