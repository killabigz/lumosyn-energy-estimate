# App Store And Play Store Readiness Notes

This is not legal advice. It is a technical preparation document based on the current Lumosyn app behavior.

## Current Data Collection Signals

The app currently collects contact information, estimate answers, recommendation outputs, attribution fields, and high-level analytics/performance data.

Likely disclosure categories should be reviewed by counsel or the person responsible for app store submissions before release.

## Likely Disclosure Categories

| Category | Current Lumosyn behavior | Notes |
| --- | --- | --- |
| Contact Info | Collects `customers.name`, `customers.whatsapp`, and optional `customers.email`. | Phone number is the main customer deduplication key. |
| User Content / Other Data | Collects estimate answers: goal, appliances, optional custom appliance, runtime, budget, timeline, and generated recommendation context. | Budget is a preference band, not a payment card or transaction. Free-text custom appliance should be treated carefully. |
| Usage Data / Analytics | Stores UTM/source/landing/referrer values on completed assessment rows when campaign links or referrers exist. Vercel Web Analytics is mounted. | If attribution is used for marketing decisions, Developer Marketing may apply. |
| Diagnostics | Vercel Speed Insights is mounted for real-user performance monitoring. | Review Vercel behavior/settings before final disclosure. |

## Likely Data Purposes

| Purpose | Current fit |
| --- | --- |
| App functionality | Required for generating and saving the estimate recommendation. |
| Customer support / follow-up | Contact info and assessment context allow follow-up after a submitted estimate. |
| Analytics / product improvement | Vercel Analytics, Speed Insights, and completed-assessment attribution help understand usage and flow performance. |
| Developer marketing | Applies if campaign attribution is used to decide where and how Lumosyn markets. |

## Current Privacy Strengths

- No cookies or localStorage tracking are added for UTM attribution.
- No unofficial WhatsApp scraping is used.
- `WHATSAPP_ENABLED=false` keeps automatic WhatsApp sending paused until real consent setup is complete.
- No payment data is collected by Lumosyn.
- No location is collected directly by Lumosyn.
- No contacts or address book data are collected.
- No photos, audio, or camera/microphone data are collected.
- Supabase writes happen through server API routes, not direct client table writes.
- WhatsApp values are not exposed with `NEXT_PUBLIC_`.

## Current Risks And Gaps

- A public privacy policy page is not yet created.
- A data deletion/request process is not yet created.
- A retention policy is not yet defined.
- Admin/HQ access control is not yet built.
- Any `lead_assessments` view must remain secured and not public.
- An exposed Meta temporary token from screenshots should not be reused.
- Future mobile wrappers may introduce new SDK/privacy requirements beyond the web app.
- Free-text `other_appliance` and `referrer` values should be minimized and reviewed because they can contain unexpected detail.
- Legacy `estimate_submissions` should be checked in production; if it exists and contains rows, migrate or delete it intentionally.

## Mobile Wrapper Watchlist

Before wrapping this web app as a mobile app, confirm whether the wrapper adds:

- Device identifiers
- Push notification tokens
- In-app browser or deep-link tracking
- Crash reporting SDKs
- Location permission prompts
- Camera, microphone, contacts, photos, or storage permissions
- Payment or subscription SDKs

Any new SDK or permission can change the required App Store / Play Store privacy answers.

## Recommended Preparation Before Submission

- Publish a privacy policy that explains contact info, estimate answers, attribution, analytics, diagnostics, retention, and deletion requests.
- Define a deletion/export workflow for `customers` and related `assessments`.
- Decide whether inactive leads should be deleted or anonymized after a fixed period.
- Confirm production Supabase RLS, table access, and any reporting views are not publicly readable.
- Keep `WHATSAPP_ENABLED=false` until the WhatsApp consent flow is production-ready.
- Verify Vercel Analytics and Speed Insights disclosures against current Vercel settings.
- Keep screenshots, docs, and support materials free of access tokens or service-role keys.
