"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { QRCodeSVG } from "qrcode.react";
import {
  getTwoFactorStatus,
  enableTwoFactor,
  confirmTwoFactor,
  disableTwoFactor,
  type TwoFactorStatus,
  type TwoFactorEnableResponse,
} from "@/lib/api/auth";

type Step = "status" | "setup" | "confirm";

export default function TwoFactorSettingsPage() {
  const { user } = useAuthStore();

  const [step, setStep] = useState<Step>("status");
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [setupData, setSetupData] = useState<TwoFactorEnableResponse | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await getTwoFactorStatus();
      setStatus(data);
    } catch (err) {
      setError("Failed to load 2FA status");
    }
  };

  const handleEnable = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await enableTwoFactor();
      setSetupData(data);
      setStep("setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await confirmTwoFactor(code);
      setStatus({
        enabled: data.enabled,
        confirmed: data.enabled,
        requires_mfa: false,
        setup_required: false,
        has_recovery_codes: data.recovery_codes?.length > 0,
      });
      setStep("status");
      setCode("");
      setSetupData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await disableTwoFactor({ password });
      setStatus({
        enabled: false,
        confirmed: false,
        requires_mfa: status?.requires_mfa ?? false,
        setup_required: false,
        has_recovery_codes: false,
      });
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const canEnable2FA = user?.roles?.some((r) => r === "admin" || r === "main_board");

  // Generate otpauth URL from secret for QR code (secure approach)
  const otpauthUrl = useMemo(() => {
    if (!setupData?.secret) return null;
    const issuer = encodeURIComponent("Kurdish Terminology");
    const account = encodeURIComponent(user?.email || "user");
    const secret = setupData.secret;
    return `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}`;
  }, [setupData?.secret, user?.email]);

  if (!status) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!canEnable2FA) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">
          Two-Factor Authentication
        </h1>
        <p className="mt-4 text-sm text-text-muted dark:text-gray-400">
          Two-factor authentication is only available for administrators and board
          members.
        </p>
      </div>
    );
  }

  const inputClasses =
    "w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800";

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground dark:text-white">
          Two-Factor Authentication
        </h1>
        <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
          Add an extra layer of security to your account
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-danger-light px-4 py-3 text-sm text-danger dark:bg-red-900/30 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {step === "status" && (
        <div className="max-w-2xl">
          <div className="rounded-lg border border-border bg-surface-raised p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground dark:text-white">
                  {status.enabled ? "2FA Enabled" : "2FA Disabled"}
                </h3>
                <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
                  {status.enabled
                    ? "Your account is protected with two-factor authentication."
                    : "Your account is not protected with two-factor authentication."}
                </p>
              </div>
              <div
                className={`h-12 w-12 rounded-full ${
                  status.enabled
                    ? "bg-success-light/20 dark:bg-green-900/30"
                    : "bg-warning-light/20 dark:bg-yellow-900/30"
                } flex items-center justify-center`}
              >
                {status.enabled ? (
                  <svg
                    className="h-6 w-6 text-success dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6 text-warning dark:text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {!status.enabled ? (
                <button
                  onClick={handleEnable}
                  disabled={loading}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? "Enabling..." : "Enable 2FA"}
                </button>
              ) : (
                <div className="w-full">
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-danger hover:text-danger/80 dark:text-red-400">
                      Disable Two-Factor Authentication
                    </summary>
                    <form onSubmit={handleDisable} className="mt-4 space-y-4">
                      <div>
                        <label
                          htmlFor="disable-password"
                          className="mb-1.5 block text-sm font-medium text-text-secondary dark:text-gray-300"
                        >
                          Confirm Password
                        </label>
                        <input
                          id="disable-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className={inputClasses}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading || !password}
                        className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger/90 disabled:pointer-events-none disabled:opacity-50"
                      >
                        {loading ? "Disabling..." : "Disable 2FA"}
                      </button>
                    </form>
                  </details>
                </div>
              )}
            </div>

            {status.has_recovery_codes && status.enabled && (
              <div className="mt-6 rounded-md bg-surface p-4 dark:bg-gray-700">
                <p className="text-sm font-medium text-foreground dark:text-white">
                  Recovery Codes
                </p>
                <p className="mt-1 text-sm text-text-muted dark:text-gray-400">
                  You have recovery codes available. Use these if you lose access
                  to your authenticator app.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === "setup" && setupData && (
        <div className="max-w-2xl">
          <div className="rounded-lg border border-border bg-surface-raised p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-foreground dark:text-white">
              Set Up Two-Factor Authentication
            </h3>
            <p className="mt-2 text-sm text-text-muted dark:text-gray-400">
              Scan the QR code below with your authenticator app (Google
              Authenticator, Authy, etc.), then enter the verification code to
              complete setup.
            </p>

            <div className="mt-6 flex justify-center">
              {otpauthUrl && (
                <div className="rounded-lg bg-white p-4">
                  <QRCodeSVG
                    value={otpauthUrl}
                    size={200}
                    level="M"
                    includeMargin={false}
                    fgColor="#000000"
                    bgColor="#ffffff"
                  />
                </div>
              )}
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-text-secondary dark:text-gray-300">
                Or enter this code manually:
              </label>
              <code className="block rounded-lg bg-surface p-3 text-sm font-mono text-foreground dark:bg-gray-700 dark:text-white">
                {setupData.secret}
              </code>
            </div>

            <div className="mt-6">
              <label className="mb-1.5 block text-sm font-medium text-text-secondary dark:text-gray-300">
                Recovery Codes (save these!):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {setupData.recovery_codes?.map((code, i) => (
                  <code
                    key={i}
                    className="rounded bg-surface p-2 text-xs font-mono text-foreground dark:bg-gray-700 dark:text-white"
                  >
                    {code}
                  </code>
                ))}
              </div>
              <p className="mt-2 text-xs text-text-muted dark:text-gray-400">
                Save these recovery codes in a safe place. You can use them to
                access your account if you lose your authenticator device.
              </p>
            </div>

            <form onSubmit={handleConfirm} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="verify-code"
                  className="mb-1.5 block text-sm font-medium text-text-secondary dark:text-gray-300"
                >
                  Verification Code
                </label>
                <input
                  id="verify-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  required
                  autoFocus
                  className={`${inputClasses} tracking-widest text-center text-lg`}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep("status");
                    setSetupData(null);
                    setCode("");
                  }}
                  disabled={loading}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface disabled:pointer-events-none disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify & Enable"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
