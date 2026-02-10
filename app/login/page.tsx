"use client";

import { useState } from "react";
import { login } from "./action";
import { LockKeyhole, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const result = await login(formData); // This might redirect if successful

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100 selection:bg-emerald-500/30">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div className="p-8 pb-0 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-6 border border-emerald-500/20">
              <LockKeyhole className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-zinc-400 text-sm">
              Enter your secure access key to continue.
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative group">
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Enter access key"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3.5 pl-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200"
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-400 font-medium px-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                    <span className="w-1 h-1 rounded-full bg-red-400" />
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Access Dashboard</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-zinc-800/50 bg-zinc-900/30 p-4 text-center">
            <p className="text-xs text-zinc-600">
              Secured by{" "}
              <span className="text-zinc-500 font-medium">Cresra</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
