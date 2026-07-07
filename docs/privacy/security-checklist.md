# Lumosyn Security And Privacy Checklist

This checklist is a technical readiness aid. It is not legal advice.

## Secrets And Environment Variables

- [ ] Secrets are never committed to git.
- [ ] `.env.local` and production secret files are not added to the repo.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is server-side only.
- [ ] `WHATSAPP_ACCESS_TOKEN` is server-side only.
- [ ] `WHATSAPP_VERIFY_TOKEN` is server-side only.
- [ ] `NEXT_PUBLIC_` is used only for values that are safe to expose publicly.
- [ ] Actual env values are not pasted into docs, issues, screenshots, support chats, or PR descriptions.
- [ ] Temporary Meta tokens from screenshots are not reused.

## Supabase

- [ ] RLS remains enabled on `customers`.
- [ ] RLS remains enabled on `assessments`.
- [ ] No public read policies are added to lead/customer tables.
- [ ] Service-role access is used only inside server routes and server-only modules.
- [ ] Any `lead_assessments` view remains secured and not public.
- [ ] The `lead_assessments` view is used only for internal/server-side HQ access.
- [ ] Reporting/export workflows avoid exposing phone numbers or free-text fields unless needed.
- [ ] A backup/export process is defined before scale.
- [ ] A deletion/anonymization process is defined before scale.

## WhatsApp

- [ ] `WHATSAPP_ENABLED=false` until production consent setup is complete.
- [ ] No automatic WhatsApp sending is enabled without a dedicated production number and approved template.
- [ ] WhatsApp tokens are kept private.
- [ ] No token screenshots are used for production operations.
- [ ] Webhook verify token is required for GET verification.
- [ ] Webhook POST handling does not reveal internal errors to Meta or the browser.
- [ ] Opt-in and opt-out replies are recorded accurately.
- [ ] Opt-out status is respected before any future sending behavior is added.

## Tracking And Analytics

- [ ] UTM/source tracking does not use cookies or localStorage.
- [ ] Tracking params are sanitized before being used or saved.
- [ ] `landing_page` accepts only safe local paths.
- [ ] Referrer values are treated as potentially personal or sensitive.
- [ ] Vercel Analytics and Speed Insights disclosures are reviewed before mobile submission.
- [ ] Campaign attribution is disclosed if used for marketing decisions.

## Data Minimization And Retention

- [ ] A privacy policy page is created before broad launch or mobile submission.
- [ ] A user data deletion/request process exists.
- [ ] A retention schedule exists for inactive leads.
- [ ] Free-text `other_appliance` values are reviewed for minimization risk.
- [ ] Legacy `estimate_submissions` is checked, migrated, or removed if no longer needed.
- [ ] Test records are deleted or clearly separated from production lead data.

## App And Deployment

- [ ] `npm run lint` passes before deployment.
- [ ] `npm run build` passes before deployment.
- [ ] Server API errors do not expose secrets or stack traces.
- [ ] Production logs avoid printing request payloads containing contact info.
- [ ] Admin/HQ access control is designed before internal lead dashboards are exposed.
- [ ] `/hq` and `/hq/*` remain protected before any customer data is rendered.
- [ ] HQ credentials are stored only in environment variables.
- [ ] HQ credentials are not committed to the repo or exposed in screenshots.
- [ ] Customer data is not exposed client-side outside protected HQ surfaces.
- [ ] Mobile wrapper SDKs and permissions are reviewed before app store submission.
