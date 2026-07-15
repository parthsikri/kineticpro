"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const err = urlParams.get("error");
      if (err) {
        setError(err);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid credentials");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-black px-4 relative">
      <div className="w-full max-w-md p-8 rounded-2xl bg-charcoal border border-border space-y-6 shadow-2xl relative z-10">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="font-semibold text-lg tracking-widest uppercase brand-title text-white">
              KINETIC <span className="text-gold font-light">PRO</span>
            </span>
          </Link>
          <h2 className="text-xl font-semibold text-off-white">Welcome back</h2>
          <p className="text-xs text-muted">Sign in to manage your thumbnails and account</p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted font-bold uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black border border-border text-sm text-off-white placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-muted font-bold uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black border border-border text-sm text-off-white placeholder:text-muted focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="premium-btn w-full py-3.5 flex items-center justify-center gap-2 text-sm mt-6"
          >
            <span>{loading ? "Signing In..." : "Sign In"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-[10px] text-muted font-bold uppercase tracking-wider">or</span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* Google OAuth Button */}
        <Link
          href="/api/auth/google"
          className="w-full py-3.5 rounded-xl border border-white/10 hover:border-white/30 bg-black/40 hover:bg-black/80 text-off-white hover:text-white transition-all flex items-center justify-center gap-3 text-sm font-semibold cursor-pointer"
        >
          {/* Custom SVG Google Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.16-3.16C17.45 1.68 14.9 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.86 3C6.02 7.78 8.78 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.71 2.88c2.16-1.99 3.42-4.92 3.42-8.56z"
            />
            <path
              fill="#FBBC05"
              d="M5.1 14.72c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.24 7.14C.45 8.73 0 10.51 0 12.39s.45 3.66 1.24 5.25l3.86-2.92z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.96-1.08 7.95-2.91l-3.71-2.88c-1.03.69-2.35 1.1-4.24 1.1-3.22 0-5.98-2.74-6.96-5.68l-3.86 3C3.2 20.27 7.24 23 12 23z"
            />
          </svg>
          <span>Continue with Google</span>
        </Link>

        <div className="text-center pt-2">
          <p className="text-xs text-muted">
            Don't have an account?{" "}
            <Link href="/register" className="text-gold hover:underline font-semibold">
              Create an account
            </Link>
          </p>
        </div>

      </div>

      {/* Background gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gold/15 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>
    </div>
  );
}
