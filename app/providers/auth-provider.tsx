"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { PasswordConfirmationModal } from "@/components/ui/password-confirmation-modal";
import { cancelPendingPasswordConfirmation } from "@/lib/api/client";

/**
 * Auth Provider Component
 * - Waits for Zustand persist to finish rehydrating from localStorage
 * - Then calls hydrate() to fetch fresh user data from API
 * - Handles password confirmation modal globally
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const requiresPasswordConfirmation = useAuthStore((s) => s.requiresPasswordConfirmation);
  const hydratedRef = useRef(false);

  useEffect(() => {
    setIsClient(true);

    // Wait for Zustand persist to finish rehydrating from localStorage
    // This prevents race condition where _skipNextHydrate hasn't been loaded yet
    const performHydration = () => {
      if (!hydratedRef.current) {
        hydratedRef.current = true;
        useAuthStore.getState().hydrate();
      }
    };

    // Check if zustand persist has already hydrated
    const persistApi = (useAuthStore as unknown as { persist?: { hasHydrated: () => boolean } }).persist;
    if (persistApi?.hasHydrated()) {
      performHydration();
    } else {
      // Wait a tick for zustand to finish rehydrating, then call hydrate
      // setTimeout ensures zustand persist has completed before we check _skipNextHydrate
      const timeoutId = setTimeout(performHydration, 0);
      return () => clearTimeout(timeoutId);
    }
  }, []);

  const handleCloseModal = () => {
    useAuthStore.setState({
      requiresPasswordConfirmation: false,
      pendingPasswordCallback: null,
    });
    // Cancel the pending request
    cancelPendingPasswordConfirmation();
  };

  if (!isClient) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <PasswordConfirmationModal
        isOpen={requiresPasswordConfirmation}
        onClose={handleCloseModal}
      />
    </>
  );
}
