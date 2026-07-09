# Lumosyn Data Flow

This document explains how visitor data, estimate answers, recommendations, Supabase writes, campaign attribution, WhatsApp replies, and analytics move through the current Lumosyn app.

## Simple Diagram

```text
Campaign link
  -> /go/[source]
  -> /?utm_source=...&utm_medium=...&utm_campaign=...
  -> Homepage CTA
  -> /estimate?utm_...&landing_page=...
  -> EstimateFlow
  -> Recommendation engine
  -> POST /api/estimate-submissions
  -> Supabase customers
  -> Supabase assessments

Protected /hq
  -> HQ server action
  -> Supabase assessments internal follow-up fields

Meta WhatsApp webhook
  -> /api/whatsapp/webhook
  -> Supabase customers reply/status fields

Root layout
  -> Vercel Web Analytics
  -> Vercel Speed Insights
```

## Landing Page To Estimate Flow

Visitors may land directly on `/` or arrive through a clean campaign link such as `/go/tiktok`.

When the visitor lands on `/` with UTM/source values, `app/page.tsx` uses `buildEstimateHrefFromSearchParams` from `lib/analytics/utm.ts` to build the estimate CTA. The CTA sends the visitor to `/estimate` with sanitized tracking params and a `landing_page` value.

No cookies or localStorage are added for this tracking handoff.

## Estimate Flow To Recommendation Engine

`app/estimate/page.tsx` parses tracking query params and passes them into `components/estimate/EstimateFlow.tsx`.

`EstimateFlow` collects:

- Goal
- Appliances
- Appliance quantities for selected appliances
- Optional custom appliance when `Other` is selected
- Runtime
- Budget
- Timeline
- Name
- WhatsApp number
- Optional email

When the visitor completes the last step, `EstimateFlow` calls `getRecommendation` from `lib/recommendation/recommendation-engine.ts`.

The recommendation engine:

- Normalizes answer labels into stable IDs.
- Normalizes selected appliance quantities when present, defaulting missing quantities to `1`.
- Groups appliances into load groups.
- Uses appliance quantities to influence the recommendation band, 48V planning range, and caution wording.
- Builds inverter, battery, solar, and backup labels.
- Maps timeline to a journey stage.

## Estimate Flow To API Route

After generating the recommendation, `EstimateFlow` POSTs to `/api/estimate-submissions`.

Payload includes:

- Contact fields
- Estimate answers
- Appliance quantities for selected appliances
- Recommendation output labels
- Tracking context
- Browser referrer when available

The route returns `{ ok: true }` when the save completes. If saving fails, the user still sees the recommendation with a save failure note.

## API Route To Supabase Customers

`app/api/estimate-submissions/route.ts` validates the payload and normalizes the WhatsApp number to a Jamaican local format such as `8765550123`.

The API then:

- Looks for an existing `customers` row with the same WhatsApp number.
- Updates `name`, `email`, `journey_stage`, and `updated_at` when the customer already exists.
- Creates a new customer when no matching row exists.

This deduplicates customers by WhatsApp number.

## API Route To Supabase Assessments

After resolving the customer, the API:

- Sets existing latest assessments for that customer to `is_latest=false`.
- Inserts a new `assessments` row with `is_latest=true`.
- Saves estimate answers, recommendation labels, journey stage, source, UTM values, landing page, and referrer.
- Saves appliance quantities with assessment data when provided by the estimate flow.

This preserves assessment history while making it easy to find the newest assessment.

## Protected HQ Follow-Up Updates

`/hq` is protected before rendering and loads customer-linked lead data
server-side only. Module 19 adds a protected HQ server action that can update
internal assessment follow-up fields:

- `lead_status`
- `lead_priority`
- `internal_note`
- `follow_up_at`
- `last_contacted_at`
- `lead_updated_at`

These fields are for internal follow-up only. There is no public or
customer-facing access to them, no public lead API is added, and client-side
Supabase is not used for lead/customer reads or writes.

## WhatsApp Webhook To Customers Table

`app/api/whatsapp/webhook/route.ts` supports Meta WhatsApp webhook verification and inbound message handling.

GET verification:

- Reads `hub.mode`, `hub.verify_token`, and `hub.challenge`.
- Returns the challenge only when `hub.verify_token` matches `WHATSAPP_VERIFY_TOKEN`.

POST handling:

- Accepts JSON webhook payloads.
- Extracts incoming text messages.
- Normalizes the sender phone number to the stored customer WhatsApp format.
- Updates matching `customers` rows with `whatsapp_last_reply` and `whatsapp_last_reply_at`.
- Sets `community_status=joined` for replies such as `YES`, `Y`, `JOIN`, or `START`.
- Sets `community_status=opted_out` for replies such as `NO`, `N`, `STOP`, or `UNSUBSCRIBE`.

Unknown senders and malformed payloads do not crash the webhook; the route returns success to avoid repeated Meta retries.

## Campaign Link To UTM Tracking To Assessment Row

`app/go/[source]/route.ts` maps clean links to UTM values:

| Clean link | Redirect values |
| --- | --- |
| `/go/tiktok` | `utm_source=tiktok`, `utm_medium=bio`, `utm_campaign=launch_v1` |
| `/go/instagram` | `utm_source=instagram`, `utm_medium=bio`, `utm_campaign=launch_v1` |
| `/go/facebook` | `utm_source=facebook`, `utm_medium=post`, `utm_campaign=launch_v1` |
| `/go/whatsapp` | `utm_source=whatsapp`, `utm_medium=status`, `utm_campaign=launch_v1` |
| `/go/direct` | `utm_source=direct`, `utm_medium=manual`, `utm_campaign=launch_v1` |
| Unknown source | `utm_source=direct`, `utm_medium=unknown`, `utm_campaign=launch_v1` |

The homepage carries those values into the estimate URL. The estimate page stores the sanitized values in tracking context, removes tracking params from the visible URL, and sends them with the final submission. The API saves them on the `assessments` row.

## Vercel Analytics And Speed Insights

`app/layout.tsx` mounts:

- `@vercel/analytics/next`
- `@vercel/speed-insights/next`

At a high level:

- Vercel Web Analytics helps show visits, page views, and referrers in Vercel.
- Vercel Speed Insights helps monitor real-user performance.
- Supabase remains the app-owned source for completed estimate attribution.

Review Vercel dashboard settings and documentation before mobile app disclosure or privacy policy publication.

## WhatsApp Sending Pause

`lib/whatsapp/client.ts` returns a skipped result unless `WHATSAPP_ENABLED=true`.

Current safe behavior:

- Estimates save.
- Customers can enter a WhatsApp number.
- No automatic WhatsApp welcome message is sent.
- Consent/status fields can exist for future setup.

`WHATSAPP_ENABLED` must remain `false` until production consent, Meta template, phone number, and operational processes are ready.
