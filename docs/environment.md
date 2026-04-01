# Environment Setup

This project uses Doppler project `locus-t-ai-backend` for local development and deployment secrets.

## Commands

```bash
doppler setup
doppler run --project locus-t-ai-backend --config dev -- corepack pnpm dev
doppler run --project locus-t-ai-backend --config prd -- corepack pnpm build
doppler run --project locus-t-ai-backend --config prd -- corepack pnpm start
```

## Public Vs Private

Public values are safe to read in the browser and start with `NEXT_PUBLIC_`.

Server-only values never reach client code and should only be read from server components, route handlers, or server utilities.

## Env Vars

### Public

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER`

### Server-only

- `SITE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `GOOGLE_SHEETS_APPS_SCRIPT_URL`
- `GOOGLE_SHEETS_WEBHOOK_URL`
- `GOOGLE_SHEETS_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL_DEV`
- `RESEND_FROM_EMAIL_PROD`
- `RESEND_TO_EMAIL_DEV`
- `RESEND_TO_EMAIL_PROD`
- `WHATSAPP_PHONE_NUMBER`
- `PUBLIC_GTM_CONTAINER_ID`
- `PUBLIC_GA4_MEASUREMENT_ID`

## Notes

- `GOOGLE_SHEETS_APPS_SCRIPT_URL` is the preferred name for the Apps Script endpoint.
- `GOOGLE_SHEETS_WEBHOOK_URL` is supported as a backward-compatible alias.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` support browser-side Supabase access if needed later.
- `SITE_URL` is the server-side canonical URL; `NEXT_PUBLIC_SITE_URL` is the browser-safe alias.
- `NEXT_PUBLIC_GTM_ID` is the browser-safe GTM container ID; `PUBLIC_GTM_CONTAINER_ID` and `GTM_CONTAINER_ID` are supported aliases.
- `RESEND_FROM_EMAIL_DEV` and `RESEND_TO_EMAIL_DEV` are useful for non-production testing.
- `RESEND_FROM_EMAIL_PROD` and `RESEND_TO_EMAIL_PROD` should be used in production.
- Attribution is persisted to `sessionStorage` and a first-party cookie, with `trackingSessionId`, landing page fields, page history, and captured query params preserved across internal navigation.
- Success events are only emitted after the backend lead API responds, and the client dedupes them in session storage.

## Manual Setup Still Needed

- GTM container `KHB` has already been created under GTM account `6346744109`.
- GA4 property `K` has already been created under GA4 account `389036374`.
- The live GTM container ID is `GTM-MP76J52T`.
- The live GA4 measurement ID is `G-9HW75Y9W34`.
- You can still override either ID with `NEXT_PUBLIC_GTM_ID` or `PUBLIC_GA4_MEASUREMENT_ID` later if you want a different deployment target.
- Keep Supabase row-level security and the `leads_KHB` table aligned with the SQL in [`scripts/create-leads-table.sql`](../scripts/create-leads-table.sql).
