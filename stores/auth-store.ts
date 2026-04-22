import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, MfaRequiredError, ApiError } from "@/lib/api/client";
import { confirmPassword } from "@/lib/api/auth";
import type { User, LoginResponse } from "@/lib/api/types";

// ============================================
// TYPES
// ============================================

interface LoginCredentials {
  email: string;
  password: string;
  code?: string;
  recovery_code?: string;
}

interface AuthState {
  // User state
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  _hydrated: boolean;  // Track if Zustand persist has finished hydrating
  isAuthenticated: boolean;  // Computed property for auth status

  // MFA state
  mfaPending: boolean;
  pendingCredentials: LoginCredentials | null;

  // Password confirmation state
  requiresPasswordConfirmation: boolean;
  pendingPasswordCallback: ((password: string) => Promise<void>) | null;

  // Internal state to prevent hydration right after login
  _skipNextHydrate: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithMfa: (code: string) => Promise<void>;
  loginWithRecoveryCode: (recoveryCode: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  hydrate: () => Promise<void>;
  clearMfaPending: () => void;
  confirmPassword: (password: string) => Promise<void>;
  executeSensitiveAction: <T>(action: () => Promise<T>) => Promise<T>;
}

// ============================================
// AUTH STORE
// ============================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,  // Start as false to avoid loading spinner
      _hydrated: false,  // Track if Zustand persist has finished hydrating
      isAuthenticated: false,  // Auth status flag
      mfaPending: false,
      pendingCredentials: null,
      requiresPasswordConfirmation: false,
      pendingPasswordCallback: null,
      _skipNextHydrate: false,  // Prevent hydration right after login

      // Login with email/password
      login: async (email: string, password: string) => {
        try {
          const res = await api.post<LoginResponse>("/api/v1/auth/login", { email, password });
          set({
            user: res.user,
            token: res.token,
            refreshToken: res.refresh_token ?? null,
            mfaPending: false,
            pendingCredentials: null,
            isLoading: false,
            isAuthenticated: true,
            _skipNextHydrate: true,  // Skip hydration since we just got user data
_hydrated: true,  // Mark as hydrated since we just set the state
          });
        } catch (error) {
          // Check if MFA is required (202 from Fortify)
          if (error instanceof MfaRequiredError) {
            set({
              mfaPending: true,
              pendingCredentials: { email, password },
              isLoading: false,
            });
            throw error; // Re-throw to let caller know MFA is required
          }
          // For other errors, just throw them
          throw error;
        }
      },

      // Continue login with TOTP code
      loginWithMfa: async (code: string) => {
        const creds = get().pendingCredentials;
        if (!creds) throw new Error("No pending login credentials");

        const res = await api.post<LoginResponse>("/api/v1/auth/login", {
          ...creds,
          code,  // Fortify uses 'code'
        });

        set({
          user: res.user,
          token: res.token,
          refreshToken: res.refresh_token ?? null,
          mfaPending: false,
          pendingCredentials: null,
          isLoading: false,
          isAuthenticated: true,
          _skipNextHydrate: true,  // Skip hydration since we just got user data
_hydrated: true,  // Mark as hydrated since we just set the state
        });
      },

      // Continue login with recovery code
      loginWithRecoveryCode: async (recoveryCode: string) => {
        const creds = get().pendingCredentials;
        if (!creds) throw new Error("No pending login credentials");

        const res = await api.post<LoginResponse>("/api/v1/auth/login", {
          ...creds,
          recovery_code: recoveryCode,
        });

        set({
          user: res.user,
          token: res.token,
          refreshToken: res.refresh_token ?? null,
          mfaPending: false,
          pendingCredentials: null,
          isLoading: false,
          isAuthenticated: true,
          _skipNextHydrate: true,  // Skip hydration since we just got user data
_hydrated: true,  // Mark as hydrated since we just set the state
        });
      },

      // Clear MFA pending state
      clearMfaPending: () => {
        set({ mfaPending: false, pendingCredentials: null });
      },

      // Logout
      logout: async () => {
        try {
          await api.post("/api/v1/auth/logout");
        } catch {
          // Token may already be invalid
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isLoading: false,
          isAuthenticated: false,
          mfaPending: false,
          pendingCredentials: null,
          requiresPasswordConfirmation: false,
          pendingPasswordCallback: null,
          _skipNextHydrate: false,
        });
      },

      // Set tokens manually
      setTokens: (token: string, refreshToken: string) => {
        set({ token, refreshToken });
      },

      // Set user manually
      setUser: (user: User) => set({ user }),

      // Hydrate user from token
      hydrate: async () => {
        const token = get().token;
        const skipHydrate = get()._skipNextHydrate;

        // Reset skip flag
        if (skipHydrate) {
          set({ _skipNextHydrate: false, isLoading: false });
          return;
        }

        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          const fetched = await api.get<User>("/api/v1/auth/me");
          const existing = get().user;
          const user: User = {
            ...fetched,
            roles: fetched.roles?.length ? fetched.roles : existing?.roles ?? [],
          };
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err) {
          // Only clear auth state on 401 (invalid token)
          // For other errors (network, 500, etc.), keep the user logged in
          if (err instanceof ApiError && err.status === 401) {
            set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
          } else {
            // For other errors, just stop loading but keep auth state
            set({ isLoading: false });
          }
        }
      },

      // Confirm password for sensitive actions
      confirmPassword: async (password: string) => {
        await confirmPassword(password);
        set({
          requiresPasswordConfirmation: false,
          pendingPasswordCallback: null,
        });
      },

      // Execute sensitive action with automatic password confirmation
      executeSensitiveAction: async <T>(action: () => Promise<T>) => {
        try {
          return await action();
        } catch (error: unknown) {
          // Check if password confirmation is required
          if (
            error instanceof Error &&
            "requires_password_confirmation" in error &&
            (error as { requires_password_confirmation: boolean }).requires_password_confirmation
          ) {
            return new Promise<T>((resolve, reject) => {
              set({
                requiresPasswordConfirmation: true,
                pendingPasswordCallback: async (confirmedPassword: string) => {
                  try {
                    await confirmPassword(confirmedPassword);
                    const result = await action();
                    resolve(result);
                  } catch (err) {
                    reject(err);
                  }
                },
              });
            });
          }
          throw error;
        }
      },
    }),
    {
      name: "ktp-auth",
      partialize: (state) => ({
        // SECURITY: Do NOT persist tokens to localStorage
        // Tokens are stored in HTTP-only cookies by the backend
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        _skipNextHydrate: state._skipNextHydrate,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true;
          state.isLoading = false;
        }
      },
    }
  )
);
