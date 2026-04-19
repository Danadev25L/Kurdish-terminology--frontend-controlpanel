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
      <div className="hidden w-[45%] flex-col justify-center bg-[#111827] px-12 md:flex">
        <h1 className="text-[32px] font-extrabold tracking-[-0.03em] text-white">
          KTP
        </h1>
        <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6366f1]">
          Control Panel
        </p>
        <p className="mt-6 text-[14px] leading-relaxed text-[#94a3b8]">
          Kurdish Terminology Portal<br />
          Admin &amp; Expert Workspace
        </p>
        <div className="mt-10 flex gap-2">
          <div className="h-2 w-2 rounded-full bg-[#6366f1]" />
          <div className="h-2 w-2 rounded-full bg-[#374151]" />
          <div className="h-2 w-2 rounded-full bg-[#374151]" />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-[#fafafa] px-6 py-12">
        <div className="w-full max-w-[320px]">
          {/* Mobile-only logo */}
          <div className="mb-8 md:hidden">
            <h1 className="text-[24px] font-extrabold tracking-[-0.03em] text-[#111827]">
              KTP<span className="ml-0.5 text-[12px] font-semibold text-[#6366f1] align-super">CP</span>
            </h1>
          </div>

          <h2 className="text-[20px] font-bold text-[#111827]">Sign in</h2>
          <p className="mt-1 text-[13px] text-[#9ca3af]">
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5 text-[13px] text-[#111827] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold text-[#374151]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5 text-[13px] text-[#111827] placeholder:text-[#9ca3af] focus:border-[#6366f1] focus:outline-none focus:ring-1 focus:ring-[#6366f1]"
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
              className="w-full rounded-lg bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1e293b] disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-[12px] text-[#9ca3af]">
            Forgot password?
          </p>
        </div>
      </div>
    </div>
  );
}
