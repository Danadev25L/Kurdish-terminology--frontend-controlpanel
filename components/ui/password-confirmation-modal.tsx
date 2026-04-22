"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface PasswordConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

/**
 * Modal for confirming password before sensitive operations
 * Automatically shown when Fortify's password.confirm middleware returns 423
 */
export function PasswordConfirmationModal({
  isOpen,
  onClose,
  title = "Confirm Password",
  message = "Please enter your password to continue with this sensitive action.",
}: PasswordConfirmationModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { confirmPassword, pendingPasswordCallback } = useAuthStore();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // First confirm the password
      await confirmPassword(password);

      // Then execute the pending action (retry original request)
      if (pendingPasswordCallback) {
        await pendingPasswordCallback(password);
      }

      setPassword("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password confirmation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-surface-raised p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-text-muted dark:text-gray-400">{message}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="confirm-password"
              className="mb-1.5 block text-sm font-medium text-text-secondary dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoFocus
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-danger-light px-3 py-2 text-sm text-danger dark:bg-red-900/30 dark:text-red-400"
            >
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface disabled:pointer-events-none disabled:opacity-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !password}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:pointer-events-none disabled:opacity-50"
            >
              {isLoading ? "Confirming..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Hook to use password confirmation for sensitive actions
 * Automatically shows modal when password confirmation is required
 */
export function usePasswordConfirmation() {
  const { requiresPasswordConfirmation } = useAuthStore();

  return {
    requiresPasswordConfirmation,
  };
}
