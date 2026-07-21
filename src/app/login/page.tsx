"use client";

import { useEffect, useState } from "react";
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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
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
    <main style={{ padding: "32px", fontFamily: "Arial, sans-serif", maxWidth: "520px", margin: "0 auto" }}>
      <h1>Oye !magine Admin Login</h1>
      <p>Use the first admin account created from the bootstrap endpoint.</p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
        <label style={{ display: "grid", gap: "8px" }}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}
          />
        </label>

        <label style={{ display: "grid", gap: "8px" }}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}
          />
        </label>

        {error ? (
          <div style={{ color: "#b42318", background: "#fef3f2", padding: "12px", borderRadius: "8px" }}>
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            background: "#111827",
            color: "#ffffff",
          }}
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}