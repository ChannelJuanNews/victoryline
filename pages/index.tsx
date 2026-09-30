import Head from "next/head";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

const SITE_URL = "https://victorylinesoftware.com";
const TITLE = "Victoryline Software LLC";
const DESCRIPTION = "System Genesis — the business operating system. Launching soon.";

type Status = "idle" | "sending" | "sent" | "error";

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Soft light that trails the cursor.
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        page.style.setProperty("--mx", `${e.clientX}px`);
        page.style.setProperty("--my", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const open = () => {
    if (status === "error") setStatus("idle");
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Try again soon.");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#05070b" />
        <link rel="canonical" href={SITE_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={TITLE} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Victoryline Software LLC" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${SITE_URL}/og.png`} />
      </Head>
      <div
        ref={pageRef}
        className={`page ${geistSans.variable} ${geistMono.variable}`}
      >
        <div className="grid" aria-hidden />
        <div className="glow" aria-hidden />
        <div className="spotlight" aria-hidden />
        <div className="grain" aria-hidden />

        <header className="corner top">
          <span className="dot" aria-hidden />
          <span>Building quietly</span>
        </header>

        <main className="hero">
          <h1>Victoryline</h1>
          <div className="line" aria-hidden>
            <span />
          </div>
          <p className="sub">Software LLC</p>

          <button type="button" className="launch" onClick={open} aria-haspopup="dialog">
            <span className="tag">Launching soon</span>
            <span className="name">
              System Genesis <em>Business Operating System</em>
            </span>
            <span className="arrow" aria-hidden>
              →
            </span>
          </button>
        </main>

        <footer className="corner bottom">
          <span>© {new Date().getFullYear()} Victoryline Software LLC</span>
          <span className="coords">victorylinesoftware.com</span>
        </footer>

        <dialog
          ref={dialogRef}
          className="modal"
          aria-labelledby="access-title"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div className="panel">
            <button type="button" className="close" onClick={close} aria-label="Close">
              ×
            </button>

            {status === "sent" ? (
              <div className="done">
                <p className="tag">System Genesis</p>
                <h2 id="access-title">You&rsquo;re on the list.</h2>
                <p className="muted">We&rsquo;ll be in touch before launch.</p>
              </div>
            ) : (
              <form onSubmit={submit}>
                <p className="tag">System Genesis</p>
                <h2 id="access-title">Request early access</h2>

                <div className="row">
                  <label>
                    <span>First name</span>
                    <input name="firstName" autoComplete="given-name" autoFocus required maxLength={80} />
                  </label>
                  <label>
                    <span>Last name</span>
                    <input name="lastName" autoComplete="family-name" required maxLength={80} />
                  </label>
                </div>
                <label>
                  <span>Email</span>
                  <input name="email" type="email" autoComplete="email" required maxLength={200} />
                </label>
                <label>
                  <span>Phone</span>
                  <input name="phone" type="tel" autoComplete="tel" required maxLength={40} />
                </label>
                <label>
                  <span>Why do you want access?</span>
                  <textarea name="reason" rows={3} required maxLength={1000} />
                </label>
                <input name="company" className="hp" tabIndex={-1} autoComplete="off" aria-hidden />

                {status === "error" && <p className="error" role="alert">{error}</p>}

                <button type="submit" className="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Request access"}
                </button>
              </form>
            )}
          </div>
        </dialog>
      </div>
    </>
  );
}
