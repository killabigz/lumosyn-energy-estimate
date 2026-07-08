# Lumosyn HQ Security Review

Last reviewed: 2026-07-08

## Scope

This review covers Lumosyn HQ V1 at `/hq` and `/hq/*`, plus the customer-data
read path used by the dashboard.

HQ V1 is acceptable only for single-admin internal use. It is not a team CRM,
export system, backup system, or WhatsApp sending console.

## Protection Method

`proxy.ts` protects `/hq` and `/hq/:path*` with HTTP Basic Auth before the page
renders.

The proxy fails closed:

- If `HQ_BASIC_AUTH_USER` is missing or blank, requests return `401`.
- If `HQ_BASIC_AUTH_PASSWORD` is missing or blank, requests return `401`.
- If credentials are missing, malformed, or wrong, requests return `401`.
- Successful requests continue to the protected HQ route.

Public routes are outside the HQ proxy matcher and must remain open:

- `/`
- `/go/tiktok`
- `/estimate`

## Environment Variables

Required server-side HQ credentials:

- `HQ_BASIC_AUTH_USER`
- `HQ_BASIC_AUTH_PASSWORD`

Required server-side Supabase secret:

- `SUPABASE_SERVICE_ROLE_KEY`

Public Supabase project URL:

- `NEXT_PUBLIC_SUPABASE_URL`

Do not add `NEXT_PUBLIC_` HQ credential variables. HQ credentials must be read
only from server-side environment variables in Vercel/local env.

## Data Source

HQ reads customer and assessment data from `public.lead_assessments`, an
internal reporting view backed by `public.customers` and `public.assessments`.

The documented Supabase view grants in
`docs/supabase/module15-lead-assessments-view.sql` revoke access from:

- `anon`
- `authenticated`

`lead_assessments` should not be readable by `anon` or `authenticated` roles.
It is for internal/server-side HQ access only.

## Server-Side Data Access

`app/hq/page.tsx` is a server component. It calls `getHqOverview()` from
`lib/hq/getHqOverview.ts`.

`lib/hq/getHqOverview.ts` imports `server-only` and uses
`createSupabaseServiceClient()` from `lib/supabase/server.ts`.

`lib/supabase/server.ts` imports `server-only`, reads
`SUPABASE_SERVICE_ROLE_KEY` from server-side environment variables, and creates
a Supabase service-role client with token persistence disabled.

## Intentionally Not Exposed

- No public API route returns customer or lead records.
- No client-side Supabase customer or lead read exists.
- No public route has direct access to `lead_assessments`.
- No HQ credentials are stored in source control.
- No `NEXT_PUBLIC` HQ credentials exist.
- No WhatsApp sending is enabled by this module.
- No team accounts, CRM editing, export, or backup behavior is added by this
  module.

## Basic Auth Limitations

Basic Auth is simple and acceptable for single-admin HQ V1, but it is not a
long-term team access model.

Known limitations:

- Shared credentials do not identify individual users.
- There is no role-based access control.
- There is no admin audit log.
- There is no MFA.
- Credential rotation is manual.
- Browser credential caching can keep a session active longer than intended.
- It does not provide granular export, deletion, or retention controls.

## Current Acceptable Use

Current acceptable use is single-admin internal HQ V1 for Daniel to view recent
customer and assessment activity.

The dashboard is read-only and should remain limited to internal review until a
stronger admin access model and customer-data governance workflows are in
place.

## Future Improvement Path

- Proper admin auth.
- Role-based access.
- Audit logs.
- Data export controls.
- Deletion/retention workflow.
- Stronger session management.

## npm Audit Result

`npm audit` was reviewed on 2026-07-08.

Result:

- 7 vulnerabilities total.
- 2 moderate vulnerabilities.
- 5 high vulnerabilities.
- Reported packages include `postcss` through `next` and
  `serialize-javascript` through the `next-pwa` dependency chain.
- `npm audit fix --force` is suggested, but it would install breaking package
  changes.

No package upgrades were made in this security/documentation module. Review
dependency remediation separately and avoid force upgrades without a dedicated
compatibility pass.
