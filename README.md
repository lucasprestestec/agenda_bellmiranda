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

## WhatsApp automation

Sending happens **outside this app**, in a separate agent project that talks
to a self-hosted Evolution API instance (not reachable from Vercel, so this
site can't call it directly). This app only exposes what needs sending and
lets that agent report back what went out:

| Endpoint | Auth | Purpose |
| --- | --- | --- |
| `GET /api/agent/pending-messages` | `Authorization: Bearer $CRON_SECRET` | Returns ready-to-send confirmations, reminders, and today's summary |
| `POST /api/agent/mark-sent` | same | Body `{ appointmentId, type: "confirmation" \| "reminder" }` — marks `confirmationSentAt` / `reminderSentAt` so the appointment isn't handed out again on the next poll |

Each confirmation/reminder item carries a `recipients` array (phone in
E.164 + exact text per recipient, from `lib/whatsapp/templates.js`) rather
than a single phone/text — the client always gets one, and whoever performs
that service (`Service.staffName` / `.staffPhone`, editable per service in
`/admin/servicos`) gets a second copy with different wording if set. The
external agent is expected to send to every recipient in the list before
calling `mark-sent` for that item — if only some succeed, don't call it, so
the whole item (all recipients) is retried on the next poll rather than
tracked per-recipient. It should poll `pending-messages` every 30–60s, and
dedupe the daily summary by date on its own side (there's no
`dailySummarySentAt` field here — the summary is just recomputed fresh on
every poll).

`Appointment.confirmationSentAt` / `.reminderSentAt` are the only guard
against duplicate sends — nothing in this app calls the agent or times
anything; the agent's own cron decides when reminders (evening before) and
the daily summary (morning) go out, in `America/Sao_Paulo`.

`CRON_SECRET` (generate with `openssl rand -hex 32`) is shared with the
agent project out of band — it's not a Vercel-managed value anymore, just a
plain shared secret both sides check.

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
