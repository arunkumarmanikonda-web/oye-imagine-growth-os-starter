"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [nextUrl, setNextUrl] = useState("/admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("next");

    if (value && value.startsWith("/")) {
      setNextUrl(value);
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      window.location.href = nextUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen text-slate-900">
      <section className="oi-shell py-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="oi-card overflow-hidden px-8 py-10 sm:px-10">
            <div className="oi-chip px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Secure admin access
            </div>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Sign in to the <span className="oi-brand-gradient">Oye !magine</span>{" "}
              admin workspace
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Access governed execution workflows, specialist marketplace
              operations, request triage, proposals, and activity tracking.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="oi-card-soft p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                  Access model
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Use the first admin account provisioned through the bootstrap
                  flow or an authorized admin credential.
                </p>
              </div>

              <div className="oi-card-soft p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-pink-600">
                  Redirect
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  After sign-in, you will be redirected to:
                </p>
                <div className="mt-3 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
                  {nextUrl}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="oi-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
              >
                Back to home
              </Link>
              <Link
                href="/marketplace"
                className="oi-button-secondary inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold"
              >
                View marketplace
              </Link>
            </div>
          </div>

          <div className="oi-card p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600">
                Admin login
              </p>
              <h2 className="oi-section-title mt-2 text-2xl">
                Continue to workspace
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Enter your email and password to continue.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="oi-input px-4 py-3"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="oi-input px-4 py-3"
                  placeholder="Enter password"
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="oi-button-primary inline-flex w-full items-center justify-center px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              Protected areas include admin operations, request routing,
              specialist assignment, proposal workflows, and execution review.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}