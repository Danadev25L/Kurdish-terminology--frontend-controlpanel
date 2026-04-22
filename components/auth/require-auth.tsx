"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { Spinner } from "@/components/ui/spinner";

/**
 * RequireAuth Component
 * - Protects routes that require authentication
 * - Redirects to login if not authenticated
 * - Waits for Zustand persist to finish hydrating before checking auth
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  const _hydrated = useAuthStore((s) => s._hydrated);
  const redirectRef = useRef(false);

  useEffect(() => {
    // Only check authentication after Zustand has finished hydrating
    if (_hydrated && !isLoading && !isAuthenticated && !redirectRef.current) {
      redirectRef.current = true;
      window.location.href = "/login";
    }
  }, [_hydrated, isLoading, isAuthenticated, user, token]);

  // Show loading while Zustand is hydrating OR auth is loading
  if (!_hydrated || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
