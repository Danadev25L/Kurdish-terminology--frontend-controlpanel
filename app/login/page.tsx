"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password"
      );
      emailRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-border bg-surface-raised px-3 py-3 text-[13px] text-foreground placeholder:text-text-muted focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4 md:p-8">
      <div className="flex w-full max-w-[900px] overflow-hidden rounded-2xl shadow-xl">
        {/* Brand panel — hidden on mobile */}
        <div className="hidden w-[45%] flex-col justify-center bg-gradient-to-br from-primary-700 via-foreground to-foreground px-10 py-12 md:flex">
          {/* Geometric illustration */}
          <div className="relative mb-10 h-40 w-40" aria-hidden="true">
            <svg viewBox="0 0 200 200" className="h-full w-full">
              <circle cx="70" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              <circle cx="130" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
              <circle cx="100" cy="110" r="50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
              <polygon points="100,30 130,85 70,85" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
              <polygon points="100,130 130,75 70,75" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
              <circle cx="100" cy="80" r="6" fill="rgba(99,102,241,0.6)" />
              <circle cx="70" cy="60" r="3" fill="rgba(99,102,241,0.4)" />
              <circle cx="130" cy="60" r="3" fill="rgba(99,102,241,0.4)" />
              <circle cx="100" cy="110" r="3" fill="rgba(99,102,241,0.4)" />
            </svg>
          </div>

          <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-white">
            KTP
          </h1>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-400">
            Control Panel
          </p>
          <p className="mt-5 max-w-[280px] text-[13px] leading-relaxed text-white/60">
            Standardizing Kurdish terminology through collaborative expert review
          </p>

          <ul className="mt-8 space-y-3">
            {[
              "Domain-based collaboration",
              "Multi-stage voting process",
              "Expert-driven consensus",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-[13px] text-white/70">
                <svg className="h-4 w-4 shrink-0 text-primary-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Form panel */}
        <div className="flex flex-1 items-center justify-center bg-surface-raised px-8 py-12">
          <div className="w-full max-w-[320px]">
            {/* Mobile-only branding */}
            <div className="mb-8 md:hidden">
              <h1 className="text-[24px] font-extrabold tracking-[-0.03em] text-foreground">
                KTP<span className="ml-0.5 text-[12px] font-semibold text-primary-500 align-super">CP</span>
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-text-muted">
                Standardizing Kurdish terminology through collaborative expert review
              </p>
            </div>

            <h2 className="text-[20px] font-bold text-foreground">Sign in</h2>
            <p className="mt-1 text-[13px] text-text-muted">
              Enter your credentials to continue
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-[12px] font-semibold text-text-secondary">
                  Email
                </label>
                <input
                  id="login-email"
                  ref={emailRef}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-[12px] font-semibold text-text-secondary">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className={`${inputClasses} pe-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="rounded-lg bg-danger-light px-3 py-2 text-[13px] text-danger">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-foreground px-4 py-3 text-[13px] font-semibold text-white hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
