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
