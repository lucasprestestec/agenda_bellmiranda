# Bell Miranda — website + booking + agenda

Production implementation of the `Bell Miranda Design System` handoff
(`../project`, `../chats/chat1.md`). Next.js (App Router) + Prisma/SQLite —
one app serving the public site, a real booking flow backed by a database,
and a password-protected agenda for Bell to manage appointments.

## Stack

- **Next.js 16** (App Router, JavaScript, self-hosted Google Fonts via `next/font`)
- **Prisma + SQLite** for `Service` / `Appointment` / `BlockedSlot` — swap the
  `DATABASE_URL` in `.env` for Postgres/MySQL later; SQLite is fine for a
  single-studio, low-concurrency booking calendar.
- **lucide-react** for icons (flagged substitution — see `project/readme.md` → ICONOGRAPHY)
- No external auth/session library — a small scrypt + signed-cookie helper in `lib/auth.js`

## Getting started

```bash
npm install
cp .env.example .env
npm run hash-password -- "your-admin-password"   # paste the output into ADMIN_PASSWORD_HASH
# set ADMIN_SESSION_SECRET to any long random string, e.g. `openssl rand -hex 32`
npx prisma migrate dev --name init                # creates prisma/dev.db
npm run db:seed                                    # loads the placeholder service catalog
npm run dev
```

Visit `http://localhost:3000`.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Editorial one-page site (hero, portfolio, about, services, why-Bell, gallery, testimonials, booking) |
| `/agendar` | Dedicated desktop/responsive booking flow — what "Agendar" in the header links to |
| `/reservar` | Compact phone-width booking link (for the Instagram bio / WhatsApp away message), mirrors the design kit's `ui_kits/booking` screen |
| `/admin/login` | Password login for Bell |
| `/admin` | Agenda: day-by-day appointment list, mark completed/cancelled, block off time |

## Data model (`prisma/schema.prisma`)

- **Service** — the catalog shown on `/` and in booking. **There is no admin
  UI to edit services** — edit `prisma/seed.mjs` and re-run `npm run db:seed`,
  or edit rows directly (`npx prisma studio`). `/` revalidates every 5
  minutes, so catalog edits show up without a redeploy.
- **Appointment** — created by `POST /api/appointments`, re-validated
  server-side against real availability (working hours minus existing
  appointments/blocks) inside a transaction to avoid double-booking.
- **BlockedSlot** — time Bell blocks off from `/admin` (lunch, personal
  time, etc.); subtracted from availability the same way appointments are.

Working hours, slot granularity, and the deposit rate live in `lib/studio.js`
(currently Mon–Sat 9h–19h / 30-min slots / 20% deposit, from the footer copy
and booking summary note in the design kit — not yet confirmed by the studio).

## What's still a placeholder

Carried over from the design handoff (`project/readme.md`), **not yet
confirmed by the studio**:

- Service names, descriptions, prices and durations (`prisma/seed.mjs`)
- Address, WhatsApp number, email, Instagram handle (`lib/site-config.js`)
- Studio photography (`public/assets/*.png` are crops from the brand board)
- Script/serif fonts are Google Fonts substitutes (Parisienne, Cormorant
  Garamond) — the brand's real script/serif were never supplied as files
- Lucide is a substituted icon set (no Instagram brand icon in the current
  package — `Camera` stands in for it in `components/core/Icon.jsx`)

## Admin auth

Single shared password (this is a one-person studio, not a multi-user app).
`lib/auth.js` hashes with Node's built-in `scrypt` (no extra dependency) and
signs a session cookie with HMAC-SHA256. `proxy.js` (Next 16's renamed
`middleware.js`) protects `/admin/*` and `/api/admin/*`.

To rotate the password: `npm run hash-password -- "new-password"` and update
`ADMIN_PASSWORD_HASH` in `.env`.

## Notes on the port from the design kit

`project/ui_kits/website/*.jsx` were already real, dependency-free React
components (`export function X(props)`, inline styles referencing the CSS
custom properties in `project/tokens/`) — they were copied into
`components/` with minimal changes: `'use client'` directives, `lucide-react`
imports instead of the CDN `window.lucide` global, `next/image` instead of
plain `<img>`, and real navigation/data instead of the click-through demo's
local state. Visual values (colors, spacing, radii, type scale) were copied
verbatim from `project/tokens/*.css` into `app/tokens/*.css` — nothing was
rounded or restyled.
