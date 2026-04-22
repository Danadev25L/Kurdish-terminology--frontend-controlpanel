import { api, MfaRequiredError, PasswordConfirmationRequiredError } from "./client";
import type { User, LoginResponse } from "./types";

export { MfaRequiredError, PasswordConfirmationRequiredError };

// ============================================
// LOGIN / LOGOUT
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
  code?: string;           // TOTP code for 2FA (Fortify)
  recovery_code?: string;  // Recovery code for 2FA (Fortify)
}

/**
 * Login with email/password
 * If 2FA enabled, returns 202 with requires_mfa=true
 * Then call again with code or recovery_code
 */
export function login(credentials: LoginCredentials) {
  return api.post<LoginResponse>("/api/v1/auth/login", credentials);
}

/**
 * Logout and revoke current access token
 */
export function logout() {
  return api.post("/api/v1/auth/logout");
}

/**
 * Get current authenticated user
 */
export function getMe() {
  return api.get<User>("/api/v1/auth/me");
}

/**
 * Get user profile with domains
 */
export function getProfile() {
  return api.get<User>("/api/v1/profile");
}

/**
 * Refresh access token using refresh token
 */
export function refreshToken(refreshToken: string) {
  return api.post<LoginResponse>("/api/v1/auth/refresh", { refresh_token: refreshToken });
}

// ============================================
// PROFILE MANAGEMENT
// ============================================

/**
 * Update user profile
 */
export function updateProfile(data: {
  name?: string;
  preferred_language?: string;
}) {
  return api.patch<User>("/api/v1/profile", data);
}

/**
 * Change password (requires current password)
 */
export function changePassword(data: {
  current_password: string;
  password: string;
  password_confirmation?: string;
}) {
  return api.post("/api/v1/profile/change-password", {
    current_password: data.current_password,
    password: data.password,
    password_confirmation: data.password_confirmation ?? data.password,
  });
}

// ============================================
// PASSWORD CONFIRMATION (Fortify)
// ============================================

/**
 * Confirm password for sensitive operations
 * Valid for 3 hours in session
 */
export function confirmPassword(password: string) {
  return api.post<{ message: string }>("/api/v1/auth/confirm-password", { password });
}

// ============================================
// TWO-FACTOR AUTHENTICATION (Fortify)
// ============================================

export interface TwoFactorStatus {
  enabled: boolean;
  confirmed: boolean;
  requires_mfa: boolean;
  setup_required: boolean;
  has_recovery_codes: boolean;
}

export interface TwoFactorEnableResponse {
  secret: string;
  qr_code_url: string;
  recovery_codes: string[];
  message: string;
}

export interface TwoFactorConfirmResponse {
  enabled: boolean;
  recovery_codes: string[];
  message: string;
}

/**
 * Get 2FA status for current user
 */
export function getTwoFactorStatus() {
  return api.get<TwoFactorStatus>("/api/v1/auth/two-factor/status");
}

/**
 * Enable 2FA - generates QR code and recovery codes
 * User must call confirmTwoFactor() with valid code to complete setup
 */
export function enableTwoFactor() {
  return api.post<TwoFactorEnableResponse>("/api/v1/auth/two-factor/enable");
}

/**
 * Confirm 2FA setup with verification code
 * Must be called after enableTwoFactor() to activate 2FA
 */
export function confirmTwoFactor(code: string) {
  return api.post<TwoFactorConfirmResponse>("/api/v1/auth/two-factor/confirm", { code });
}

/**
 * Disable 2FA (requires password)
 * NOTE: This endpoint has been removed from the backend.
 * 2FA is now permanent once enabled per security policy.
 * @deprecated Backend endpoint removed - 2FA cannot be disabled
 */
export function disableTwoFactor(data: {
  password: string;
  current_code?: string;
}) {
  // This endpoint no longer exists in the backend
  // 2FA is permanent once enabled for security reasons
  return Promise.reject(new Error("Two-factor authentication cannot be disabled once enabled. Please contact an administrator if you need assistance."));
}
