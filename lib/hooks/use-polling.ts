import { useEffect, useRef, useCallback } from "react";

interface UsePollingOptions {
  interval?: number; // milliseconds
  enabled?: boolean;
  immediate?: boolean;
}

/**
 * Custom hook for polling data at regular intervals
 * @param callback - Function to call on each interval
 * @param options - Polling configuration
 */
export function usePolling(
  callback: () => void | Promise<void>,
  options: UsePollingOptions = {}
) {
  const { interval = 120000, enabled = true, immediate = true } = options;
  const timeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const poll = useCallback(async () => {
    if (!isMountedRef.current || !enabled) return;

    try {
      await callback();
    } catch (error) {
      console.error("Polling error:", error);
    }

    // Schedule next poll
    if (isMountedRef.current && enabled) {
      timeoutRef.current = window.setTimeout(() => {
        poll();
      }, interval);
    }
  }, [callback, enabled, interval]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled && immediate) {
      poll();
    }

    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, immediate, poll]);

  // Manual trigger function
  const trigger = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    poll();
  }, [poll]);

  return { trigger };
}
