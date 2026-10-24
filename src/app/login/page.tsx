"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Lock, 
  Mail, 
  Loader2, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  KeyRound
} from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "@/actions/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleQuickFill = () => {
    setEmail("admin@edrealm.in");
    setPassword("Password@123");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await loginUser({ email: email.trim(), password });

        if (res.success) {
          toast.success("Welcome back! Redirecting to command center...");
          const target = callbackUrl.startsWith("/") ? callbackUrl : "/";
          router.push(target);
          router.refresh();
        } else {
          setError(res.error || "Authentication failed. Please check your credentials.");
          toast.error(res.error || "Login failed");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(message);
        toast.error(message);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFBFF] text-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-indigo-200/40 via-violet-200/30 to-pink-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold mb-1 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Operations Command Center</span>
          </div>
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white font-black text-base shadow-sm">
              ER
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              EdRealm Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Sign in with authorized administrator credentials to manage faculty operations.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/85 backdrop-blur-md rounded-3xl border border-white/60 p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.08)] space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@edrealm.in"
                  required
                  disabled={isPending}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50/70 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isPending}
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50/70 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3 rounded-full bg-slate-900 text-white font-bold text-sm hover:bg-black transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-4 border-t border-slate-100">
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 text-xs text-indigo-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-indigo-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Demo Admin Credentials
                </span>
                <button
                  type="button"
                  onClick={handleQuickFill}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Auto Fill</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-600 space-y-0.5">
                <div>Email: <strong className="text-slate-800">admin@edrealm.in</strong></div>
                <div>Password: <strong className="text-slate-800">Password@123</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          EdRealm Operations &bull; Protected Access System
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFBFF] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
