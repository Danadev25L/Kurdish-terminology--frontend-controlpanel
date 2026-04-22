"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useNavigate } from "@/lib/hooks/use-navigate";
import { MfaRequiredError } from "@/lib/api/client";

type LoginStep = "credentials" | "mfa" | "recovery";

export default function LoginPage() {
  const { login, loginWithMfa, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [step, setStep] = useState<LoginStep>("credentials");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (step === "credentials") {
        await login(email, password);
        await new Promise(resolve => setTimeout(resolve, 200));
        navigate("/dashboard");
      } else if (step === "mfa") {
        await loginWithMfa(code);
        await new Promise(resolve => setTimeout(resolve, 200));
        navigate("/dashboard");
      }
    } catch (err) {
      if (err instanceof MfaRequiredError) {
        setStep("mfa");
      } else {
        setError(err instanceof Error ? err.message : "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-tr from-green-100/40 to-cyan-100/40 blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl">
        {/* Illustration */}
        <div className="mb-8 flex justify-center" aria-hidden="true">
          <svg
            viewBox="0 0 400 200"
            className="h-32 w-full max-w-xs sm:h-40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Book base */}
            <path
              d="M80 140 Q200 160 320 140 L320 160 Q200 180 80 160 Z"
              fill="url(#bookGradient)"
              opacity="0.9"
            />
            {/* Book pages */}
            <path
              d="M85 142 Q200 160 315 142 L315 155 Q200 173 85 155 Z"
              fill="#ffffff"
              opacity="0.8"
            />
            <path
              d="M90 144 Q200 160 310 144 L310 152 Q200 168 90 152 Z"
              fill="#ffffff"
              opacity="0.6"
            />

            {/* Letter K (Kurdish/English connection) */}
            <g transform="translate(160, 95)">
              <path
                d="M15 5 L15 45 M15 25 L40 5 M15 25 L40 45"
                stroke="#3b82f6"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Floating elements - language symbols */}
            <g className="animate-float" style={{ animationDelay: "0s" }}>
              <circle cx="60" cy="60" r="12" fill="#3b82f6" opacity="0.15" />
              <text x="60" y="65" textAnchor="middle" fontSize="14" fill="#3b82f6" opacity="0.8">A</text>
            </g>
            <g className="animate-float" style={{ animationDelay: "0.5s" }}>
              <circle cx="340" cy="70" r="12" fill="#3b82f6" opacity="0.15" />
              <text x="340" y="75" textAnchor="middle" fontSize="14" fill="#3b82f6" opacity="0.8">ک</text>
            </g>
            <g className="animate-float" style={{ animationDelay: "1s" }}>
              <circle cx="100" cy="110" r="10" fill="#3b82f6" opacity="0.15" />
              <text x="100" y="114" textAnchor="middle" fontSize="12" fill="#3b82f6" opacity="0.8">B</text>
            </g>
            <g className="animate-float" style={{ animationDelay: "1.5s" }}>
              <circle cx="300" cy="100" r="10" fill="#3b82f6" opacity="0.15" />
              <text x="300" y="104" textAnchor="middle" fontSize="12" fill="#3b82f6" opacity="0.8">ز</text>
            </g>

            {/* Connection lines */}
            <path
              d="M72 60 Q120 80 160 95"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.4"
            />
            <path
              d="M328 70 Q280 85 240 95"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.4"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Logo/Brand */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-blue-600 sm:text-4xl">
            Kurdish Terminology Portal
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Control Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-900">
            {step === "mfa" ? "Two-Factor Authentication" : "Sign in"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {step === "mfa" ? "Enter your 6-digit authentication code" : "Enter your credentials to continue"}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {step !== "mfa" && (
              <>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-colors pe-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === "mfa" && (
              <div>
                <label htmlFor="code" className="mb-2 block text-sm font-medium text-slate-700">
                  Authentication Code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-lg tracking-widest text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="mt-4 text-sm text-slate-500 hover:text-slate-700"
                >
                  ← Back to login
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (step === "mfa" && code.length !== 6)}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? "Signing in..." : step === "mfa" ? "Verify" : "Sign in"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Kurdish Terminology Portal • Control Panel
        </p>
      </div>

      {/* Floating animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
