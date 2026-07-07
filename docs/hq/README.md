# Lumosyn HQ V1

Lumosyn HQ V1 is the first protected internal dashboard for viewing saved
customers and assessments without using the Supabase table editor.

## Access

HQ is available at `/hq`.

The route is protected with HTTP Basic Auth before the page renders. Configure
the credentials in server-side environment variables:

```bash
HQ_BASIC_AUTH_USER=
HQ_BASIC_AUTH_PASSWORD=
```

Do not prefix these variables with `NEXT_PUBLIC_`, and do not commit real
credential values to the repo.

## What V1 Shows

- Summary counts for customers, assessments, joined WhatsApp status, pending
  WhatsApp status, latest assessment date, and top traffic source.
- The latest 25 assessment records from the internal lead assessment view.
- Customer name, WhatsApp number, source, estimate answers, journey stage,
  recommendation, community status, and latest-assessment flag.

## Why It Is Read-Only

HQ V1 is visibility only. It helps Daniel review lead activity without adding
CRM behavior before the privacy, retention, and operational processes are ready.

V1 intentionally does not include:

- Editing leads or customer records.
- Deleting leads or customer records.
- Exporting or backing up lead data.
- CRM tasks, notes, owners, or pipeline actions.
- AI agent behavior.
- WhatsApp sending or campaign automation.

## Security Notes

- `/hq` and any future `/hq/*` routes must remain protected server-side.
- HQ credentials live only in environment variables.
- Lead data is loaded server-side with the Supabase service-role client.
- Lead data must not be fetched from client-side Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser.
- `public.lead_assessments` is for internal/server-side HQ usage only.
- Do not grant `anon` or `authenticated` public read access to the view.

## Future Modules

- Lead notes.
- Export and backup workflows.
- Alerts.
- Content intelligence.
- Strategic defense layer.
