import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { fontVars } from "@/lib/fonts";
import s from "@/styles/admin.module.css";

// Add a tab: create pages/admin/<name>.tsx and list it here.
const TABS = [{ href: "/admin", label: "To-do" }];

type Props = { user: string; title: string; children: ReactNode };

export default function AdminLayout({ user, title, children }: Props) {
  const { pathname } = useRouter();

  return (
    <div className={`${s.shell} ${fontVars}`}>
      <Head>
        <title>{`${title} · Victoryline Admin`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#05070b" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <header className={s.header}>
        <div className={s.bar}>
          <Link href="/admin" className={s.brand}>
            Victoryline <span className={s.badge}>Admin</span>
          </Link>
          <div className={s.account}>
            <span className={s.user}>
              <span className={s.avatar} aria-hidden>
                {user[0]}
              </span>
              <span className={s.userName}>{user}</span>
            </span>
            <form method="post" action="/api/auth/logout">
              <button type="submit" className={s.ghost}>
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className={s.tabs} aria-label="Dashboard">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={s.tab}
              aria-current={pathname === tab.href ? "page" : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className={s.main}>{children}</main>
    </div>
  );
}
