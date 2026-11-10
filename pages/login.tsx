import type { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, type FormEvent } from "react";
import { getSessionUser } from "@/lib/auth";
import { fontVars } from "@/lib/fonts";
import s from "@/styles/admin.module.css";

export const getServerSideProps: GetServerSideProps = async ({ req }) =>
  getSessionUser(req)
    ? { redirect: { destination: "/admin", permanent: false } }
    : { props: {} };

export default function Login() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Try again.");
      await router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setPending(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign in · Victoryline</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#05070b" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className={`page ${fontVars}`}>
        <div className="grid" aria-hidden />
        <div className="glow" aria-hidden />
        <div className="grain" aria-hidden />

        <main className={`panel ${s.login}`}>
          <form onSubmit={submit}>
            <p className="tag">Victoryline · Admin</p>
            <h1 className={s.loginTitle}>Sign in</h1>
            <label>
              <span>Username</span>
              <input
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoFocus
                required
                maxLength={100}
              />
            </label>
            <label>
              <span>Password</span>
              <span className={s.reveal}>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                />
                <button
                  type="button"
                  className={s.eye}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    {showPassword && <path d="M4 4l16 16" />}
                  </svg>
                </button>
              </span>
            </label>

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="submit" disabled={pending}>
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </main>
      </div>
    </>
  );
}
