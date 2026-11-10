# Victoryline Software LLC

Landing page for Victoryline Software LLC, built with [Next.js](https://nextjs.org).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Access requests

The "System Genesis" modal posts to `/api/access`, which emails each request via [Resend](https://resend.com). Set these in `.env` (and in your host's env settings):

```bash
RESEND_API_KEY=re_...                       # required
ACCESS_EMAIL_TO=info@victorylinesoftware.com   # optional, comma-separated
ACCESS_EMAIL_FROM="System Genesis <access@victorylinesoftware.com>"  # optional, needs a verified domain
```

## Admin dashboard

Sign in at `/login` as `gerardo` or `genesis`. The dashboard lives at `/admin`; its first tab is a shared to-do list stored in the Supabase table `public.todos`.

```bash
DATABASE_URL=postgresql://...             # Supabase transaction pooler (port 6543)
SESSION_SECRET=...                        # 32+ random characters: openssl rand -base64 32
GERARDO_PASSWORD_HASH=...                 # from: npm run hash-password
GENESIS_PASSWORD_HASH=...
```

- `npm run hash-password` prompts for a password and prints the hash to paste into the matching `*_PASSWORD_HASH` variable. Changing a hash signs that user out everywhere.
- `npm run db:setup` runs every migration in `db/migrations/` in number order (`001_…`, `002_…`). Each one is idempotent, so re-running is always safe. Add a change as the next numbered file.
- To add a tab, create `pages/admin/<name>.tsx` and add it to `TABS` in `components/AdminLayout.tsx`.
