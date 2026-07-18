# Nook for Business

The cafe-owner side of Nook — a Next.js 16 app where owners claim their cafe
listing and manage it (profile, hours, photos, menu, tags, reviews, and traffic
analytics).

Backed by Supabase (Postgres + Auth + RLS), with images on DigitalOcean Spaces
and analytics sourced from PostHog.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm dev
```

If `pnpm dev` fails on a dependency pre-check, run Next directly:

```bash
./node_modules/.bin/next dev
```

## Environment

See [`.env.example`](./.env.example) for the full list and what breaks when each
is missing. The short version:

- **Supabase URL + publishable key** — required; the app won't boot without them.
- **`SUPABASE_SERVICE_ROLE_KEY`** — required; backs every privileged owner write.
- **`DO_SPACES_*`** — image uploads.
- **`RESEND_API_KEY` + `CORRECTION_REQUEST_TO`** — owner address-correction email.
- **`POSTHOG_*` + `CRON_SECRET`** — the daily analytics sync.

## How owners get in

1. An owner searches for their cafe and confirms a claim, which generates a
   verification code (`/claim/[cafeId]`).
2. They DM that code to Nook from the cafe's official Instagram account.
3. A superadmin approves the claim in **nook-admin**, which links the owner to
   the cafe and grants the `cafe_owner` role.
4. The owner signs in and lands on `/owner/dashboard`.

Owners can alternatively be invited directly from nook-admin, which sends an
invite email that lands on `/accept-invite`.

Access to `/owner/*` is gated by `middleware.ts`, which requires an authenticated
user with a `cafe_owner_cafe` row.

## Scripts

```bash
pnpm dev      # dev server
pnpm build    # production build (fails on type or lint errors)
pnpm lint     # eslint
```

## Notes

- The database schema, RPCs, and edge functions live in the **nook-supabase**
  repo, which is the source of truth for the shared Supabase project.
- Self-serve claiming can be toggled via `SELF_SERVE_CLAIM_ENABLED` in
  `lib/features.ts`.
