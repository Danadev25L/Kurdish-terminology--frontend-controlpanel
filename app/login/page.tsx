"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Dark brand panel — hidden on mobile */}
      <div className="hidden w-[45%] flex-col justify-center bg-foreground px-12 md:flex">
        <h1 className="text-[32px] font-extrabold tracking-[-0.03em] text-white">
          KTP
        </h1>
        <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-primary-500">
          Control Panel
        </p>
        <p className="mt-6 text-[14px] leading-relaxed text-text-muted">
          Kurdish Terminology Portal<br />
          Admin &amp; Expert Workspace
        </p>
        <div className="mt-10 flex gap-2">
          <div className="h-2 w-2 rounded-full bg-primary-500" />
          <div className="h-2 w-2 rounded-full bg-text-secondary" />
          <div className="h-2 w-2 rounded-full bg-text-secondary" />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-[320px]">
          {/* Mobile-only logo */}
          <div className="mb-8 md:hidden">
            <h1 className="text-[24px] font-extrabold tracking-[-0.03em] text-foreground">
              KTP<span className="ml-0.5 text-[12px] font-semibold text-primary-500 align-super">CP</span>
            </h1>
          </div>

          <h2 className="text-[20px] font-bold text-foreground">Sign in</h2>
          <p className="mt-1 text-[13px] text-text-muted">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-text-secondary">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-[13px] text-foreground placeholder:text-text-muted focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-text-secondary">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2.5 text-[13px] text-foreground placeholder:text-text-muted focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-danger-light px-3 py-2 text-[13px] text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-foreground px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-[12px] text-text-muted">
            Forgot password?
          </p>
        </div>
      </div>
    </div>
  );
}
