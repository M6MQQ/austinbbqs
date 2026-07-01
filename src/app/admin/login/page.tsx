"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push(next);
      router.refresh();
    } else {
      setError("Incorrect password");
      setBusy(false);
    }
  }

  return (
    <div className="container-abq flex min-h-[70vh] items-center justify-center">
      <form onSubmit={submit} className="card w-full max-w-sm p-6">
        <h1 className="font-display text-3xl text-cream">Admin</h1>
        <p className="mt-1 text-sm text-cream/60">
          Enter the admin password to continue.
        </p>
        <div className="mt-4">
          <label className="label" htmlFor="pw">
            Password
          </label>
          <input
            id="pw"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <button type="submit" className="btn-primary mt-4 w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
