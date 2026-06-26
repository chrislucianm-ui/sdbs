"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "../actions";
import { Lock, Eye, EyeOff, ShieldAlert, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminLoginClient() {
  const [role, setRole] = useState<"owner" | "principal">("owner");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await loginAdmin(password, role);
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
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest text-navy-900/50 font-bold">
              Select Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "owner" | "principal")}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-navy-900/10 text-navy-900 text-sm focus:border-gold-500 focus:outline-none transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%25231c4173%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_auto] bg-[right_1rem_center] bg-no-repeat pr-8"
            >
              <option value="owner">School Owner (Super Admin)</option>
              <option value="principal">School Principal (Admin)</option>
            </select>
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

        {/* Info */}
        <div className="mt-8 pt-6 border-t border-navy-900/5 text-center">
          <p className="text-[10px] text-navy-900/30 font-semibold uppercase tracking-wider leading-relaxed">
            Note: Owner passcode is <span className="text-gold-600 font-mono font-bold">admin</span>.<br />
            Principal passcode is <span className="text-gold-600 font-mono font-bold">principal</span>.
          </p>
        </div>

      </div>
    </main>
  );
}
