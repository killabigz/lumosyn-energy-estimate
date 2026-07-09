# Lumosyn Rebuild Blueprint

This document explains how to rebuild Lumosyn from scratch if needed. It is written for a future developer or AI coding agent and should be kept current as modules evolve.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- ESLint
- Supabase JavaScript client
- Supabase Postgres
- Vercel deployment
- Vercel Web Analytics
- Vercel Speed Insights
- `next-pwa` for PWA setup
- Lucide React icons

## Required Environment Variables

Do not commit real values.

| Variable | Required for | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Estimate save API | Public-safe Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Estimate save API and webhook updates | Server-only. Never expose to the browser. |
| `WHATSAPP_ACCESS_TOKEN` | Future WhatsApp sending | Server-only. Required only when sending is enabled. |
| `WHATSAPP_PHONE_NUMBER_ID` | Future WhatsApp sending | Server-only Meta phone number ID. |
| `WHATSAPP_VERIFY_TOKEN` | WhatsApp webhook verification | Server-only verification token. |
| `WHATSAPP_API_VERSION` | Future WhatsApp sending | Meta Graph API version. |
| `WHATSAPP_WELCOME_TEMPLATE_NAME` | Future WhatsApp sending | Approved template name. |
| `WHATSAPP_ENABLED` | WhatsApp send feature flag | Must remain `false` until consent and production setup are complete. |
| `INTERNAL_ALERTS_ENABLED` | Internal alerts | Optional. Defaults to `false`; set to `true` only after ntfy config is ready. |
| `INTERNAL_ALERTS_PROVIDER` | Internal alerts | Optional. Currently only `ntfy` is supported. |
| `NTFY_SERVER_URL` | Internal alerts | Server-side ntfy-compatible base URL. |
| `NTFY_TOPIC` | Internal alerts | Server-side topic name; public topics should be unguessable or protected. |
| `NTFY_ACCESS_TOKEN` | Internal alerts | Optional server-side bearer token. |
| `NEXT_PUBLIC_HQ_URL` | Internal alerts | Optional public-safe `/hq` link value. Do not put secrets here. |

## Supabase Schema Order

For a clean rebuild, run SQL in this order:

1. `docs/supabase/module9-customers-assessments.sql`
2. `docs/supabase/module11-traffic-analytics.sql`
3. `docs/supabase/module12-whatsapp-consent.sql`
4. `docs/supabase/module15-lead-assessments-view.sql`
5. `docs/supabase/module16-appliance-quantities.sql`
6. `docs/supabase/module19-lead-followup-fields.sql`

Notes:

- Supabase should provide `gen_random_uuid()`.
- RLS is enabled on `customers` and `assessments`.
- Do not add public read policies for lead data.
- Use `docs/supabase/schema.sql` only if you intentionally need the legacy `estimate_submissions` table for migration or backwards compatibility.
- If a reporting view such as `lead_assessments` is added later, it must remain secured and not publicly readable.

## Module Sequence

Rebuild in this order:

1. Foundation: Next.js, TypeScript, Tailwind, ESLint, global layout, theme, metadata, manifest, icons.
2. Shared UI: header, footer, logo, primary buttons, progress indicator.
3. Marketing pages: homepage, about page, story page.
4. Estimate flow UI: six-step form for goal, appliances, runtime, budget, timeline, and contact info.
5. Recommendation engine: answer normalization, load groups, recommendation bands, journey-stage mapping.
6. Result screen: recommendation cards, good-for list, caution/disclaimer copy, save status.
7. Supabase server client and schema: service-role server client plus `customers` and `assessments`.
8. Estimate API: validation, customer resolution, latest assessment handling, save response.
9. Campaign tracking: UTM sanitizer, clean `/go/[source]` links, landing page/referrer preservation.
10. Analytics: Vercel Web Analytics and Speed Insights.
11. WhatsApp consent foundation: server-only client, disabled send flag, webhook verification, inbound reply tracking.
12. Internal alerts foundation: optional ntfy-compatible alert after successful assessment save, disabled by default.
13. Documentation and compliance layer: architecture map, data inventory, data flow, app store notes, security checklist, rebuild blueprint.

## Core Business Rules

- The estimate flow should not require login.
- Required visitor inputs are name, Jamaican WhatsApp number, goal, appliances, runtime, budget, and timeline.
- Email is optional.
- WhatsApp input is normalized to a 10-digit Jamaican local number such as `8765550123`.
- A leading `1` country code is accepted and stripped for stored customer matching.
- `Other` appliance requires custom appliance text.
- Selected appliances may include quantity controls. Quantities default to `1`, are limited to a practical range, and are saved separately from the existing `appliances` array.
- A customer is deduplicated by `customers.whatsapp`.
- Existing customers are updated with latest name, email, and journey stage.
- Each completed estimate creates a new assessment row.
- Previous latest assessments for the same customer are marked `is_latest=false`.
- New assessment rows are inserted with `is_latest=true`.
- Assessment rows store nullable `appliance_quantities` JSON/object data keyed by selected appliance label. Existing or imported assessment rows may have `null` in this field.
- HQ should display appliance quantities from `appliance_quantities` when available, while retaining the names-only display for old rows without quantity data.
- Module 19 adds light CRM/follow-up fields and protected HQ update actions for lead status, priority, internal notes, follow-up date/time, and mark-contacted state.
- Module 20 can send a privacy-safe internal alert after a new assessment saves successfully.
- Internal alerts are optional, disabled by default, and must not include full customer name, WhatsApp number, internal notes, exact budget, or private follow-up details.
- Timeline maps to journey stage:
  - `As soon as possible` -> `Ready`
  - `Within 3 months` -> `Planning`
  - `Within 6 months` -> `Planning`
  - `Just exploring` -> `Exploring`
- Tracking values are sanitized before use.
- UTM tracking is passed through URLs and saved to Supabase; it is not stored in cookies or localStorage.
- WhatsApp welcome sending must be skipped while `WHATSAPP_ENABLED=false`.
- Inbound WhatsApp replies can update consent/status fields if the webhook is configured.

## Recommendation Engine Assumptions

Current recommendation bands:

- `12v_starter`
- `24v_home_essentials`
- `48v_larger_backup`

Current load groups:

- Low/basic loads: lights, TV, Wi-Fi, fan
- Cold storage loads: refrigerator, freezer
- Heavy/surge loads: air conditioner, water pump
- Custom/unknown loads: other

Selection assumptions:

- Module 17 uses appliance quantities when present. Missing or null quantities default to `1` for backward compatibility with older assessments and old-style estimate submissions.
- Quantity normalization only counts selected appliances, defaults invalid values to `1`, and clamps unusually high values to `10`.
- Heavy/surge loads generally push to `48v_larger_backup`.
- Freezer plus longer runtime pushes to `48v_larger_backup`.
- Multiple cold-storage quantities push toward `48v_larger_backup`.
- Multiple AC units, multiple pumps, or high mixed household quantities strengthen 48V planning labels and caution wording.
- Very heavy AC, pump, and freezer quantity combinations use an `8kW+ planning range` style output.
- Low/basic loads with short runtime, limited budget, and small quantities can use `12v_starter`.
- Cold storage or custom loads generally use `24v_home_essentials` unless heavier rules apply.
- Unknown labels fall back to safe configured defaults.

Every recommendation is a starting estimate, not a final system design. Final sizing depends on appliance wattage, usage time, and site conditions.

## Deployment Steps

1. Install dependencies with `npm install`.
2. Create Supabase project.
3. Run schema SQL in the order listed above.
4. Set server environment variables in Vercel.
5. Keep `WHATSAPP_ENABLED=false` for production until consent and Meta setup are complete.
6. Keep `INTERNAL_ALERTS_ENABLED=false` unless ntfy alerts are ready.
7. If internal alerts are enabled, set `INTERNAL_ALERTS_PROVIDER`, `NTFY_SERVER_URL`, `NTFY_TOPIC`, optional `NTFY_ACCESS_TOKEN`, and optional `NEXT_PUBLIC_HQ_URL`.
8. Deploy to Vercel.
9. Enable Vercel Web Analytics and Speed Insights in the Vercel dashboard.
10. Test clean campaign links such as `/go/tiktok`.
11. Complete a test estimate and verify `customers` and `assessments` rows.
12. Verify UTM values on the assessment row.
13. Verify the WhatsApp webhook GET challenge only after setting `WHATSAPP_VERIFY_TOKEN`.
14. Do not test real WhatsApp sends in production until the dedicated number, template, and consent process are ready.

## Testing Checklist

- `npm run lint`
- `npm run build`
- Homepage renders.
- `/about` renders.
- `/why-lumosyn-exists` renders.
- `/estimate` completes all six steps.
- Invalid Jamaican WhatsApp numbers cannot continue.
- `Other` appliance requires custom text.
- Selected appliance quantities default to 1, can increase/decrease, cannot go below 1, and are removed when the appliance is deselected.
- Recommendation appears after final step.
- Refrigerator x1, Fan x2, and Wi-Fi x1 returns a 24V-style recommendation.
- Air Conditioner x1 and Refrigerator x1 returns a 48V-style recommendation.
- Air Conditioner x2 and Water Pump x1 returns stronger 48V planning wording.
- Air Conditioner x2, Water Pump x2, and Freezer x2 returns the strongest 48V planning range.
- Failed save state does not hide the recommendation.
- API creates a new customer for a new WhatsApp number.
- API updates an existing customer for a repeated WhatsApp number.
- API creates a new assessment each time.
- Previous latest assessments become `is_latest=false`.
- UTM/source/landing/referrer values save to `assessments`.
- `appliance_quantities` saves beside `appliances` after the Module 16 SQL migration has been applied.
- `/go/[source]` redirects to homepage with expected UTM values.
- WhatsApp send remains skipped while `WHATSAPP_ENABLED=false`.
- Internal alerts remain skipped while `INTERNAL_ALERTS_ENABLED=false`.
- Internal alert payloads do not include full customer names, full WhatsApp numbers, internal notes, exact budgets, or private follow-up details.
- WhatsApp webhook verification rejects wrong tokens.
- WhatsApp webhook POST records matching customer replies.
- Supabase lead tables and any future views are not publicly readable.

## Handoff Notes

- This rebuild blueprint intentionally describes current behavior, not future product ideas.
- Do not expose secrets in screenshots, docs, commits, console logs, or frontend code.
- Do not enable WhatsApp sending as part of a rebuild unless the user explicitly requests production consent setup and confirms readiness.
- Keep documentation updated whenever schema, tracking, analytics, or messaging behavior changes.
