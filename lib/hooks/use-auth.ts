"use client";

import { useAuthStore } from "@/stores/auth-store";
import { MfaRequiredError } from "@/lib/api/client";

/**
 * Authentication Hook
 * Provides login, logout, MFA, and user state
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const isLoading = useAuthStore((s) => s.isLoading);
  const mfaPending = useAuthStore((s) => s.mfaPending);
  const pendingCredentials = useAuthStore((s) => s.pendingCredentials);
  const requiresPasswordConfirmation = useAuthStore((s) => s.requiresPasswordConfirmation);

  const login = useAuthStore((s) => s.login);
  const loginWithMfa = useAuthStore((s) => s.loginWithMfa);
  const loginWithRecoveryCode = useAuthStore((s) => s.loginWithRecoveryCode);
  const logout = useAuthStore((s) => s.logout);
  const clearMfaPending = useAuthStore((s) => s.clearMfaPending);
  const hydrate = useAuthStore((s) => s.hydrate);

  /**
   * Login with email/password
   * Returns true if MFA is required, false if login succeeded
   */
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      await login(email, password);
      return false; // No MFA required
    } catch (error) {
      if (error instanceof MfaRequiredError) {
        return true; // MFA required
      }
      throw error;
    }
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  /**
   * Check if user is admin
   */
  const isAdmin = (): boolean => {
    return hasRole("admin");
  };

  /**
   * Check if user is board member
   */
  const isBoardMember = (): boolean => {
    return hasRole("main_board");
  };

  /**
   * Check if user is domain head
   */
  const isDomainHead = (): boolean => {
    return hasRole("domain-head");
  };

  /**
   * Check if user is expert
   */
  const isExpert = (): boolean => {
    return hasRole("expert");
  };

  return {
    // State
    user,
    token,
    refreshToken,
    isLoading,
    mfaPending,
    pendingCredentials,
    requiresPasswordConfirmation,
    isAuthenticated: !!user && !!token,

    // Actions
    login: handleLogin,
    loginWithMfa,
    loginWithRecoveryCode,
    logout,
    clearMfaPending,
    hydrate,

    // Role helpers
    hasRole,
    isAdmin,
    isBoardMember,
    isDomainHead,
    isExpert,
  };
}
