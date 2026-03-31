"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LogIn, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    const supabase = createClient();

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
            },
          });

    setLoading(false);

    if (result.error) {
      setIsError(true);
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage(
        "Account created. Check your email to confirm your signup, or disable email confirmation in Supabase for demo mode.",
      );
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="glass-panel-strong w-full max-w-md rounded-[2rem] p-6 sm:p-8">
      <div className="rounded-full bg-[var(--accent-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
        {mode === "login" ? "Welcome back" : "Create your study space"}
      </div>

      <div className="mt-5 space-y-3">
        <h1 className="display-font text-4xl font-bold text-[#0f1e34]">
          {mode === "login" ? "Sign in to StudyGenie" : "Start your free workspace"}
        </h1>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Use Supabase email auth for a fast hackathon-friendly setup, then upload
          your first PDF and begin chatting with it right away.
        </p>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[#2a3b51]">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
            placeholder="student@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[#2a3b51]">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-[var(--line)] bg-white/90 px-4 py-3 text-sm outline-none focus:border-[var(--accent)]"
            placeholder="At least 6 characters"
          />
        </label>

        {message ? (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              isError
                ? "bg-[#ffe8e4] text-[#a43721]"
                : "bg-[var(--success-soft)] text-[#1f6c47]"
            }`}
          >
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--foreground)] px-4 py-3 text-sm font-bold text-white hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          {mode === "login" ? (
            <>
              <LogIn className="h-4 w-4" />
              Sign in
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create account
            </>
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setMessage(null);
          setIsError(false);
        }}
        className="mt-5 text-sm font-semibold text-[var(--secondary)]"
      >
        {mode === "login"
          ? "Need an account? Create one"
          : "Already signed up? Log in"}
      </button>
    </div>
  );
}
