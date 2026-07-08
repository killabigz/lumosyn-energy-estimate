# Lumosyn Customer Data Stewardship Rules

Last reviewed: 2026-07-08

These rules apply to every Lumosyn module that touches customer names,
WhatsApp numbers, estimate answers, budget range, traffic source, WhatsApp
consent status, or any derived lead/customer record.

## Core Rule

Customer data stays internal.

`lead_assessments` is for server-side HQ only. It must not be exposed to public
routes, client-side Supabase calls, browser code, or unauthenticated APIs.

## Required Rules

- Customer data stays internal to Lumosyn operations and protected admin/HQ
  workflows.
- `lead_assessments` is server-side HQ only.
- Every customer-data module must include a data audit before implementation.
- Do not create public lead APIs.
- Do not fetch customer or lead data from client-side Supabase calls.
- Secrets must stay in Vercel/local environment variables only.
- Exposed Meta temporary tokens from screenshots must not be reused.
- Future team access must use stronger auth than shared Basic Auth.

## Implementation Boundaries

- Server components, route handlers, and `server-only` modules may use
  server-side environment variables when required.
- `SUPABASE_SERVICE_ROLE_KEY` must never be imported into browser code or
  exposed through `NEXT_PUBLIC_` variables.
- HQ credentials must remain server-side environment variables named
  `HQ_BASIC_AUTH_USER` and `HQ_BASIC_AUTH_PASSWORD`.
- Do not add `NEXT_PUBLIC_` HQ credential variables.
- Do not return customer or lead records from public API routes.
- Do not grant `anon` or `authenticated` read access to `lead_assessments`.

## Required Audit Before Customer-Data Changes

Use `docs/security/customer-data-change-checklist.md` for every module that
adds, changes, reads, exports, deletes, syncs, or displays customer data.

The audit must be completed before coding starts and updated before deployment
if the implementation changes the data path.
