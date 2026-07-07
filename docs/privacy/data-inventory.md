# Lumosyn Data Inventory

This document lists the data Lumosyn currently collects or stores through the estimate app, Supabase tables, campaign tracking, WhatsApp webhook, and analytics setup.

This is a technical inventory, not legal advice. It should be reviewed before publishing a privacy policy or submitting a mobile app to the App Store or Play Store.

## Summary

Primary user-provided data:

- Name
- WhatsApp number
- Optional email
- Estimate answers: goal, appliances, custom appliance, runtime, budget, and timeline

Primary derived or system-generated data:

- Recommendation labels and IDs
- Journey stage
- Customer/assessment IDs and timestamps
- Latest-assessment flag
- Campaign attribution and referrer
- WhatsApp welcome/reply status fields

## Current Tables

Current live API writes:

- `public.customers`
- `public.assessments`

Legacy SQL still documents:

- `public.estimate_submissions`

The current `/api/estimate-submissions` route does not write the legacy `estimate_submissions` table.

## Customers Table

| Field name | Table/location | Example value | Purpose | Source type | May be linked to a person? | Retention recommendation | App Store / Play Store notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `id` | `customers.id` | `7b8f...` | Stable customer primary key. | System-generated | Yes, through customer row | Keep while lead/customer relationship is active; delete or anonymize when no longer needed. | Identifier tied to contact info. |
| `created_at` | `customers.created_at` | `2026-07-01T14:10:00Z` | Records when the customer row was created. | System-generated | Yes | Keep with customer row; remove on deletion. | Operational timestamp. |
| `updated_at` | `customers.updated_at` | `2026-07-01T15:20:00Z` | Records when customer data was last updated by estimate submission. | System-generated | Yes | Keep with customer row; remove on deletion. | Operational timestamp. |
| `name` | `customers.name` | `Alicia` | Personalizes the recommendation and helps follow up. | User-provided | Yes | Keep only while follow-up or customer support is needed; review stale leads after 12-24 months. | Contact Info. Disclose name collection. |
| `whatsapp` | `customers.whatsapp` | `8765550123` | Main contact identifier and deduplication key. | User-provided, normalized by server | Yes | Treat as personal contact info; delete on request and review stale leads after 12-24 months. | Contact Info. Disclose phone number collection. |
| `email` | `customers.email` | `name@example.com` | Optional alternate contact channel. | User-provided | Yes | Keep only while needed for support/follow-up; delete on request. | Contact Info if enabled in mobile disclosures. |
| `journey_stage` | `customers.journey_stage` | `Planning` | Current lead stage derived from install timeline. | Derived | Yes | Keep while lead/customer relationship is active; review with lead data. | User Content/Other Data or product personalization context. |
| `community_status` | `customers.community_status` | `pending`, `joined`, `opted_out` | Tracks WhatsApp/community consent status from defaults and webhook replies. | System-generated and derived from replies | Yes | Keep as consent/status history while contact data exists; preserve opt-out as long as needed to avoid unwanted contact. | Contact/communication preference. Important for consent documentation. |
| `whatsapp_welcome_sent_at` | `customers.whatsapp_welcome_sent_at` | `2026-07-01T15:25:00Z` | Records when the welcome template was sent. Currently remains null while sending is paused. | System-generated | Yes | Keep as communication audit history while contact data exists. | Communication history/status. |
| `whatsapp_last_reply` | `customers.whatsapp_last_reply` | `YES` | Stores latest inbound WhatsApp text reply received by webhook. | User-provided | Yes | Minimize retention; keep only as long as needed for consent/support context. | User Content/Other Data; may reveal communication preference. |
| `whatsapp_last_reply_at` | `customers.whatsapp_last_reply_at` | `2026-07-01T15:30:00Z` | Timestamp for latest inbound WhatsApp reply. | System-generated | Yes | Keep with reply/status context; remove on deletion. | Communication activity timestamp. |
| `whatsapp_opt_in_source` | `customers.whatsapp_opt_in_source` | `estimate_submission` | Records source used when a welcome send is marked. | System-generated | Yes | Keep with consent/status history. | Consent/source context for messaging disclosures. |

## Assessments Table

| Field name | Table/location | Example value | Purpose | Source type | May be linked to a person? | Retention recommendation | App Store / Play Store notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `id` | `assessments.id` | `3d40...` | Stable assessment primary key. | System-generated | Yes, through `customer_id` | Keep while assessment is needed; delete/anonymize with customer deletion. | Identifier tied to estimate record. |
| `created_at` | `assessments.created_at` | `2026-07-01T14:12:00Z` | Records when the assessment was created. | System-generated | Yes | Keep with assessment row; remove on deletion. | Operational timestamp. |
| `customer_id` | `assessments.customer_id` | `7b8f...` | Links assessment to customer. | System-generated relation | Yes | Delete/anonymize with customer row; cascade delete is defined in schema. | Identifier linking user content to contact info. |
| `goal` | `assessments.goal` | `Both` | Captures what the visitor wants solar/backup to help with. | User-provided | Yes | Keep while useful for recommendation/support; review stale leads after 12-24 months. | User Content/Other Data. |
| `appliances` | `assessments.appliances` | `{Lights, Refrigerator, Wi-Fi}` | Captures appliances the visitor wants to run. | User-provided | Yes | Keep while useful for recommendation/support; review stale leads after 12-24 months. | User Content/Other Data; may imply home energy needs. |
| `other_appliance` | `assessments.other_appliance` | `Medical device` | Captures custom appliance text when `Other` is selected. | User-provided | Yes | Minimize and review carefully; may contain sensitive free text; delete on request. | User Content/Other Data; free text may need extra disclosure caution. |
| `runtime` | `assessments.runtime` | `5-8 hours` | Captures desired backup duration. | User-provided | Yes | Keep while useful for recommendation/support. | User Content/Other Data. |
| `budget` | `assessments.budget` | `JMD $250,000-500,000` | Captures planning budget band. | User-provided | Yes | Keep while useful for recommendation/support; review stale leads. | User Content/Other Data; financial preference, not payment data. |
| `timeline` | `assessments.timeline` | `Within 3 months` | Captures install timing. | User-provided | Yes | Keep while useful for support/follow-up; review stale leads. | User Content/Other Data. |
| `journey_stage` | `assessments.journey_stage` | `Planning` | Derived stage from timeline. | Derived | Yes | Keep with assessment row. | Derived user profile/context. |
| `recommendation_id` | `assessments.recommendation_id` | `module10-24v-home-essentials-backup-range` | Stable recommendation identifier. | Derived | Yes | Keep with assessment row. | App functionality result. |
| `recommendation_title` | `assessments.recommendation_title` | `24V Home Essentials` | User-facing recommendation title. | Derived | Yes | Keep with assessment row. | App functionality result. |
| `system_size_label` | `assessments.system_size_label` | `24V Home Essentials` | System category label shown to user. | Derived | Yes | Keep with assessment row. | App functionality result. |
| `inverter_label` | `assessments.inverter_label` | `2-3kW` | Starter inverter planning label. | Derived | Yes | Keep with assessment row. | App functionality result. |
| `battery_label` | `assessments.battery_label` | `24V battery bank` | Starter battery planning label. | Derived | Yes | Keep with assessment row. | App functionality result. |
| `solar_panel_label` | `assessments.solar_panel_label` | `4-6 panels` | Starter solar panel planning label. | Derived | Yes | Keep with assessment row. | App functionality result. |
| `source` | `assessments.source` | `tiktok` or `direct` | Attribution fallback/source for the estimate. | System-generated from query params | Yes | Keep while campaign attribution is needed; aggregate/anonymize where possible. | Usage Data/Analytics or Developer Marketing if used for marketing decisions. |
| `is_latest` | `assessments.is_latest` | `true` | Marks the newest assessment for a customer. | System-generated | Yes | Keep with assessment row; old rows may be retained for history or pruned by retention policy. | Operational status flag. |
| `utm_source` | `assessments.utm_source` | `tiktok` | Campaign source attribution. | System-generated from query params | Yes | Keep while needed for attribution; consider aggregation after campaign review period. | Usage Data/Analytics; Developer Marketing if used for marketing decisions. |
| `utm_medium` | `assessments.utm_medium` | `bio` | Campaign medium attribution. | System-generated from query params | Yes | Keep while needed for attribution; aggregate/anonymize later. | Usage Data/Analytics; Developer Marketing if used for marketing decisions. |
| `utm_campaign` | `assessments.utm_campaign` | `launch_v1` | Campaign name attribution. | System-generated from query params | Yes | Keep while needed for campaign analysis; aggregate/anonymize later. | Usage Data/Analytics; Developer Marketing if used for marketing decisions. |
| `utm_content` | `assessments.utm_content` | `story_1` | Optional campaign content variant. | System-generated from query params | Yes | Keep only while useful for campaign analysis. | Usage Data/Analytics; Developer Marketing if used for marketing decisions. |
| `utm_term` | `assessments.utm_term` | `solar_backup` | Optional campaign term. | System-generated from query params | Yes | Keep only while useful for campaign analysis. | Usage Data/Analytics; Developer Marketing if used for marketing decisions. |
| `landing_page` | `assessments.landing_page` | `/?utm_source=tiktok&utm_medium=bio&utm_campaign=launch_v1` | Records the original safe landing path/query that led to the estimate. | System-generated from query params | Yes | Keep while useful for attribution/debugging; aggregate or prune later. | Usage Data/Analytics. |
| `referrer` | `assessments.referrer` | `https://example.com/page` | Records browser referrer when available. | System-generated from browser `document.referrer` | Potentially yes | Minimize retention; may include external URLs. Consider shortening, hashing, or pruning in future. | Usage Data/Analytics; disclose if used. |

## Legacy Estimate Submissions Table

`docs/supabase/schema.sql` defines a legacy `public.estimate_submissions` table. The current application code no longer writes to it. If the table exists in Supabase, treat it as legacy lead data until confirmed empty, migrated, or deleted.

| Field name | Table/location | Example value | Purpose | Source type | May be linked to a person? | Retention recommendation | App Store / Play Store notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `id` | `estimate_submissions.id` | `9a21...` | Legacy submission primary key. | System-generated | Yes | Migrate or delete if no longer needed. | Identifier tied to legacy lead. |
| `created_at` | `estimate_submissions.created_at` | `2026-06-01T10:00:00Z` | Legacy submission timestamp. | System-generated | Yes | Migrate or delete with legacy row. | Operational timestamp. |
| `name` | `estimate_submissions.name` | `Alicia` | Legacy contact name. | User-provided | Yes | Migrate to `customers` or delete if obsolete. | Contact Info. |
| `whatsapp` | `estimate_submissions.whatsapp` | `8765550123` | Legacy WhatsApp contact number. | User-provided | Yes | Migrate to `customers` or delete if obsolete. | Contact Info. |
| `email` | `estimate_submissions.email` | `name@example.com` | Legacy optional email. | User-provided | Yes | Migrate or delete if obsolete. | Contact Info. |
| `goal` | `estimate_submissions.goal` | `Both` | Legacy goal answer. | User-provided | Yes | Migrate to `assessments` or delete if obsolete. | User Content/Other Data. |
| `budget` | `estimate_submissions.budget` | `JMD $500,000-1,000,000` | Legacy budget answer. | User-provided | Yes | Migrate or delete if obsolete. | User Content/Other Data. |
| `appliances` | `estimate_submissions.appliances` | `{Lights, Fan}` | Legacy appliance answer array. | User-provided | Yes | Migrate or delete if obsolete. | User Content/Other Data. |
| `other_appliance` | `estimate_submissions.other_appliance` | `CPAP machine` | Legacy custom appliance free text. | User-provided | Yes | Review carefully; migrate only if needed, otherwise delete. | User Content/Other Data; free text caution. |
| `timeline` | `estimate_submissions.timeline` | `Just exploring` | Legacy timeline answer. | User-provided | Yes | Migrate or delete if obsolete. | User Content/Other Data. |
| `journey_stage` | `estimate_submissions.journey_stage` | `Exploring` | Legacy derived stage. | Derived | Yes | Migrate or delete if obsolete. | Derived user profile/context. |
| `community_status` | `estimate_submissions.community_status` | `pending` | Legacy community status. | System-generated | Yes | Migrate only if still authoritative; otherwise delete after confirmation. | Communication preference/status. |
| `recommendation_id` | `estimate_submissions.recommendation_id` | `module10-12v-starter-backup-range` | Legacy recommendation identifier. | Derived | Yes | Migrate or delete if obsolete. | App functionality result. |
| `recommendation_title` | `estimate_submissions.recommendation_title` | `12V Starter Backup` | Legacy recommendation title. | Derived | Yes | Migrate or delete if obsolete. | App functionality result. |
| `system_size_label` | `estimate_submissions.system_size_label` | `12V Starter Backup` | Legacy system label. | Derived | Yes | Migrate or delete if obsolete. | App functionality result. |
| `battery_label` | `estimate_submissions.battery_label` | `12V battery bank` | Legacy battery label. | Derived | Yes | Migrate or delete if obsolete. | App functionality result. |
| `inverter_label` | `estimate_submissions.inverter_label` | `600W-1.5kW` | Legacy inverter label. | Derived | Yes | Migrate or delete if obsolete. | App functionality result. |
| `solar_panel_label` | `estimate_submissions.solar_panel_label` | `1-3 panels` | Legacy solar label. | Derived | Yes | Migrate or delete if obsolete. | App functionality result. |
| `source` | `estimate_submissions.source` | `web_estimate` | Legacy source marker. | System-generated | Yes | Migrate or delete if obsolete. | Usage/Data source context. |

## Browser And Analytics Data

| Field or category | Location | Example value | Purpose | Source type | May be linked to a person? | Retention recommendation | App Store / Play Store notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| In-progress estimate state | Browser React state only | `goal=Both` | Lets the visitor complete the multi-step flow before submission. | User-provided | Not stored unless submitted | Disappears on page refresh/navigation. | Not persistent storage. |
| Query UTM/source values | URL query string before estimate page cleans visible URL | `utm_source=tiktok` | Carries campaign attribution into the submission payload. | System-generated from campaign links | Potentially yes once submitted | Do not store in cookies/localStorage; keep DB values only as long as useful. | Usage Data/Analytics; Developer Marketing if used for marketing decisions. |
| Referrer | `document.referrer` sent in submission payload | `https://example.com` | High-level attribution/debug context. | Browser-provided | Potentially yes | Minimize retention and avoid displaying publicly. | Usage Data/Analytics. |
| Vercel Web Analytics | Vercel dashboard via `app/layout.tsx` | Page view/referrer metrics | Understand traffic and product interaction at a high level. | System-generated by Vercel | Review Vercel product behavior/settings | Follow Vercel retention/settings; disclose if used in app/mobile context. | Usage Data/Analytics. |
| Vercel Speed Insights | Vercel dashboard via `app/layout.tsx` | Real-user performance metric | Monitor performance and diagnostics. | System-generated by Vercel | Review Vercel product behavior/settings | Follow Vercel retention/settings; disclose if used in app/mobile context. | Diagnostics. |

## Notes For Future Compliance Work

- Create a public privacy policy page before broader launch or mobile wrapper submission.
- Define a deletion/export request process for customer and assessment data.
- Define a retention schedule before scale. A starting point is 12-24 months for inactive leads, with shorter retention for free-text/referrer fields where possible.
- Confirm whether the legacy `estimate_submissions` table exists in production and whether it contains rows.
- Keep `WHATSAPP_ENABLED=false` until production WhatsApp consent, template, and phone number setup are complete.
- Keep the service role key server-side only.
- Do not expose Supabase tables or views such as any future `lead_assessments` view publicly.
