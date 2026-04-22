"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useApi } from "@/lib/hooks/use-api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  getTwoFactorStatus,
  enableTwoFactor,
  confirmTwoFactor,
  // disableTwoFactor - REMOVED: 2FA is permanent once enabled
} from "@/lib/api/auth";
import { updateProfile, changePassword } from "@/lib/api/auth";
import { useToastStore } from "@/stores/toast-store";
import { useI18n } from "@/i18n/context";
import type { User } from "@/lib/api/types";

export default function ProfilePage() {
  const { user } = useAuth();
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useI18n();

  // Profile section
  const [profileData, setProfileData] = useState({ name: user?.name ?? "", email: user?.email ?? "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password section
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA section
  const [twoFactorStatus, setTwoFactorStatus] = useState<{
    enabled: boolean;
    confirmed: boolean;
    requires_mfa: boolean;
    setup_required: boolean;
    has_recovery_codes: boolean;
  } | null>(null);
  const [loading2FA, setLoading2FA] = useState(false);

  // 2FA setup states
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [confirming2FA, setConfirming2FA] = useState(false);

  // 2FA disable states - REMOVED: 2FA is permanent once enabled
  // const [show2FADisable, setShow2FADisable] = useState(false);
  // const [disablePassword, setDisablePassword] = useState("");
  // const [disabling2FA, setDisabling2FA] = useState(false);

  // Load 2FA status
  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    try {
      const data = await getTwoFactorStatus();
      setTwoFactorStatus(data);
    } catch {
      addToast({ type: "error", message: t("common.error_generic") });
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    setSavingProfile(true);
    try {
      await updateProfile({
        name: profileData.name,
        preferred_language: "en",
      });
      addToast({ type: "success", message: t("messages.user_updated") });
    } catch {
      addToast({ type: "error", message: t("messages.user_update_failed") });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    setSavingPassword(true);
    try {
      await changePassword({
        current_password: passwordData.current_password,
        password: passwordData.password,
        password_confirmation: passwordData.password_confirmation,
      });
      setPasswordData({ current_password: "", password: "", password_confirmation: "" });
      addToast({ type: "success", message: t("profile.password_title") });
    } catch (err: any) {
      const errorMessage = err?.message || err?.response?.data?.message || t("common.error_generic");
      addToast({ type: "error", message: errorMessage });
    } finally {
      setSavingPassword(false);
    }
  };

  // Enable 2FA
  const handleEnable2FA = async () => {
    setLoading2FA(true);
    try {
      const data = await enableTwoFactor();
      setTwoFactorSecret(data.secret);
      setQrCodeUrl(data.qr_code_url);
      setRecoveryCodes(data.recovery_codes);
      setShow2FASetup(true);
    } catch {
      addToast({ type: "error", message: t("common.error_generic") });
    } finally {
      setLoading2FA(false);
    }
  };

  // Confirm 2FA
  const handleConfirm2FA = async () => {
    setConfirming2FA(true);
    try {
      const data = await confirmTwoFactor(verificationCode);
      setTwoFactorStatus({
        enabled: true,
        confirmed: true,
        requires_mfa: false,
        setup_required: false,
        has_recovery_codes: true,
      });
      setShow2FASetup(false);
      setVerificationCode("");

      const downloadedCodes = data.recovery_codes ?? recoveryCodes;
      if (downloadedCodes.length > 0) {
        const codesText = [
          t("profile.recovery_file_title"),
          "===================",
          ...downloadedCodes,
        ].join("\n");
        const blob = new Blob([codesText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "ktp-recovery-codes.txt";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      addToast({ type: "success", message: t("profile.2fa_title") });
    } catch {
      addToast({ type: "error", message: t("common.error_generic") });
    } finally {
      setConfirming2FA(false);
    }
  };

  // Disable 2FA - REMOVED: 2FA is permanent once enabled
  // const handleDisable2FA = async () => { ... };

  return (
    <div className="space-y-6">
      <h1 className="text-heading font-extrabold tracking-[-0.02em] text-foreground">{t("profile.title")}</h1>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.info_title")}</CardTitle>
        </CardHeader>
        <div className="space-y-4 p-6 pt-0">
          <div>
            <Input
              label={t("common.name")}
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
          </div>
          <div>
            <Input
              label={t("common.email")}
              value={profileData.email}
              disabled
              className="bg-surface opacity-60"
            />
            <p className="mt-1 text-xs text-text-muted">{t("profile.email_fixed")}</p>
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleProfileUpdate}
              loading={savingProfile}
              disabled={profileData.name === user?.name}
            >
              {t("profile.save_changes")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.password_title")}</CardTitle>
        </CardHeader>
        <div className="space-y-4 p-6 pt-0">
          <PasswordInput
            label={t("profile.current_password")}
            value={passwordData.current_password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, current_password: e.target.value })}
          />
          <PasswordInput
            label={t("profile.new_password")}
            value={passwordData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, password: e.target.value })}
          />
          <PasswordInput
            label={t("profile.confirm_password")}
            value={passwordData.password_confirmation}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
            error={
              passwordData.password_confirmation && passwordData.password !== passwordData.password_confirmation
                ? t("profile.password_mismatch")
                : undefined
            }
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handlePasswordChange}
              loading={savingPassword}
              disabled={
                !passwordData.current_password ||
                !passwordData.password ||
                !passwordData.password_confirmation ||
                passwordData.password.length < 8 ||
                passwordData.password !== passwordData.password_confirmation
              }
            >
              {t("profile.change_password")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("profile.2fa_title")}</CardTitle>
            {twoFactorStatus?.enabled && (
              <Badge variant="success">{t("profile.enabled")}</Badge>
            )}
          </div>
        </CardHeader>
        <div className="p-6 pt-0">
          {twoFactorStatus && !twoFactorStatus.enabled && (
            <div className="mb-4 rounded-lg bg-warning-light/20 border border-warning/30 px-4 py-3">
              <p className="text-sm text-warning">
                <span className="font-semibold">{t("profile.2fa_required")}</span> {t("profile.2fa_required_msg")}
              </p>
            </div>
          )}

          {!show2FASetup && (
            <div className="space-y-4">
              <p className="text-sm text-text-muted">
                {t("profile.2fa_description")}
              </p>

              {twoFactorStatus?.enabled ? (
                <div className="space-y-4">
                  <div className="rounded-lg bg-success-light/20 border border-success/30 p-4">
                    <p className="text-sm font-medium text-success">{t("profile.2fa_active")}</p>
                    <p className="mt-1 text-xs text-text-muted">
                      {t("profile.2fa_active_msg")}
                    </p>
                  </div>

                  {twoFactorStatus.has_recovery_codes && (
                    <div className="rounded-lg bg-surface p-4">
                      <p className="text-sm font-medium text-foreground">{t("profile.recovery_codes")}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {t("profile.recovery_codes_save")}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleEnable2FA}
                    loading={loading2FA}
                  >
                    {t("profile.enable_2fa")}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* 2FA Setup Flow */}
          {show2FASetup && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">{t("profile.setup_2fa")}</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {t("profile.scan_qr")}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="rounded-lg border border-border bg-white p-6">
                  <div className="flex justify-center mb-4">
                    <QRCodeSVG
                      value={qrCodeUrl}
                      size={200}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-xs text-text-muted text-center mb-2">{t("profile.manual_code")}</p>
                  <code className="text-sm font-mono bg-surface px-3 py-2 rounded block text-center">
                    {twoFactorSecret}
                  </code>
                </div>
              </div>

              {/* Recovery Codes */}
              {recoveryCodes.length > 0 && (
                <div className="rounded-lg bg-warning-light/20 border border-warning/30 p-4">
                  <p className="text-sm font-medium text-warning">{t("profile.recovery_codes")}</p>
                  <p className="mt-1 text-xs text-text-muted mb-3">
                    {t("profile.recovery_codes_single")}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {recoveryCodes.map((code, i) => (
                      <code key={i} className="text-xs font-mono bg-surface px-2 py-1 rounded text-center">
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Code Input */}
              <div>
                <Input
                  label={t("profile.verification_code")}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShow2FASetup(false);
                    setTwoFactorSecret("");
                    setQrCodeUrl("");
                    setRecoveryCodes([]);
                    setVerificationCode("");
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirm2FA}
                  loading={confirming2FA}
                  disabled={verificationCode.length !== 6}
                >
                  {t("profile.confirm_enable")}
                </Button>
              </div>
            </div>
          )}

          {/* 2FA Disable Confirmation - REMOVED: 2FA is permanent once enabled */}
        </div>
      </Card>
    </div>
  );
}
