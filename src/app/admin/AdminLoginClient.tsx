"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "../actions";
import { Lock, Eye, EyeOff, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminLoginClient() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = await loginAdmin(username, password);
    setIsSubmitting(false);

    if (res.success) {
      router.refresh();
      router.push("/admin/dashboard");
    } else {
      setError(res.error || "Login failed");
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center relative px-6 py-12 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold-500/[0.05] rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md glass-panel-gold p-8 rounded-3xl border border-gold-500/20 shadow-2xl relative z-10 bg-white/95">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-navy-900/40 hover:text-gold-600 transition-colors mb-8 font-bold"
        >
          <ArrowLeft size={12} />
          Back to Portal
        </Link>

        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full border border-gold-500/30 bg-gold-500/10 flex items-center justify-center text-gold-600 mx-auto mb-4 glow-gold">
            <Lock size={24} />
          </div>
          <h1 className="font-serif font-black text-2xl tracking-wide text-navy-900 uppercase">
            Admin Authority
          </h1>
          <p className="text-navy-900/40 text-xs font-semibold mt-1.5 uppercase tracking-wider">
            Security Clearance Required
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">
              Enter Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full pl-4 pr-4 py-3.5 rounded-xl bg-slate-50 border border-navy-900/10 text-navy-900 placeholder-navy-900/20 text-sm focus:border-gold-500 focus:outline-none transition-colors font-semibold text-left"
            />
          </div>

          <div className="flex flex-col gap-2 relative">
            <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">
              Enter Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-slate-50 border border-navy-900/10 text-navy-900 placeholder-navy-900/20 text-sm focus:border-gold-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-900/40 hover:text-navy-900 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl text-xs sm:text-sm leading-relaxed border bg-red-500/10 border-red-500/30 text-red-700 flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-brand-red-700 text-white font-semibold uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-brand-red-800 transition-colors disabled:opacity-50 duration-500 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authorizing Access...
              </>
            ) : (
              "Login to Dashboard"
            )}
          </button>
        </form>

      </div>
    </main>
  );
}
