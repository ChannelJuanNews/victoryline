import Head from "next/head";
import { useEffect, useRef } from "react";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export default function Home() {
  const pageRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <Head>
        <title>Victoryline Software LLC</title>
        <meta name="description" content="Victoryline Software LLC" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#05070b" />
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
        </main>

        <footer className="corner bottom">
          <span>© {new Date().getFullYear()} Victoryline Software LLC</span>
          <span className="coords">victorylinesoftware.com</span>
        </footer>
      </div>
    </>
  );
}
