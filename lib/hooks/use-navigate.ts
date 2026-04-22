"use client";

/**
 * Simple navigation hook that uses window.location
 * Avoids Next.js router issues with auth redirects
 */
export function useNavigate() {
  return (href: string) => {
    window.location.href = href;
  };
}
