# Lumosyn Codebase Map

This document maps the current Lumosyn Energy Estimate app so a future developer, auditor, or AI coding agent can understand how the app works without relying on chat history.

## App Summary

Lumosyn is a Next.js App Router application that helps visitors in Jamaica answer a short solar or backup power questionnaire. The app generates a practical starter recommendation, saves the lead and assessment to Supabase, preserves campaign attribution in the assessment row, and keeps WhatsApp welcome sending guarded behind `WHATSAPP_ENABLED=false`.

## Routes

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `app/page.tsx` | Homepage. Reads any safe tracking query values and builds the `Start My Free Estimate` link to `/estimate`. |
| `/about` | `app/about/page.tsx` | About page with Lumosyn mission and links back into the estimate flow. |
| `/why-lumosyn-exists` | `app/why-lumosyn-exists/page.tsx` | Story page shown after the recommendation result. |
| `/estimate` | `app/estimate/page.tsx` | Estimate flow entry point. Parses UTM/source values and passes tracking context into `EstimateFlow`. |
| `/estimate/confirmation` | `app/estimate/confirmation/page.tsx` | Older confirmation placeholder page. The current live flow shows the recommendation in `EstimateFlow` instead. |
| `/go/[source]` | `app/go/[source]/route.ts` | Clean campaign link redirector. Redirects to `/` with hidden UTM values for sources such as TikTok, Instagram, Facebook, WhatsApp, and direct. |
| `/api/estimate-submissions` | `app/api/estimate-submissions/route.ts` | Server route that validates estimate payloads, writes Supabase customer and assessment rows, and skips or sends WhatsApp welcome messages based on the feature flag. |
| `/api/whatsapp/webhook` | `app/api/whatsapp/webhook/route.ts` | Meta WhatsApp webhook. GET verifies the webhook token. POST records customer replies and opt-in/opt-out status. |

## Components

| Area | Files | Purpose |
| --- | --- | --- |
| Layout | `components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, `LandingHero.tsx`, `AboutSection.tsx`, `WhyLumosyn.tsx` | Shared marketing and navigation UI. `LandingHero` owns the homepage CTA that carries tracking into `/estimate`. |
| Estimate flow | `components/estimate/EstimateFlow.tsx`, `RecommendationResult.tsx` | Client-side questionnaire, recommendation display, save status, and post-recommendation actions. |
| UI primitives | `components/ui/PrimaryButton.tsx`, `EstimateProgress.tsx`, `LumosynLogo.tsx` | Reusable button/link styling, progress bar, and logo image wrapper. |

## Estimate Flow Files

| File | Role |
| --- | --- |
| `app/estimate/page.tsx` | Reads search params, builds `landing_page`, and passes tracking context into the client flow. |
| `components/estimate/EstimateFlow.tsx` | Stores in-progress answers in React state, validates each step, generates the recommendation, and POSTs the completed payload. |
| `components/estimate/RecommendationResult.tsx` | Renders the recommended starter system, selected appliance list, save failure message, and completion prompt. |
| `app/api/estimate-submissions/route.ts` | Server-side validation, Supabase writes, customer resolution, latest-assessment handling, and optional WhatsApp welcome send. |

## Recommendation Engine Files

| File | Role |
| --- | --- |
| `lib/recommendation/recommendation-engine.ts` | Normalizes answers, classifies appliance load groups, chooses a recommendation band, builds labels/explanations, and maps timeline to journey stage. |
| `lib/recommendation/recommendation-config.ts` | Static dataset for answer options, appliance load groups, runtime bands, budget bands, recommendation bands, and timeline stages. |
| `lib/recommendation/types.ts` | TypeScript types for answers, normalized values, journey stages, recommendation bands, and returned recommendation data. |
| `lib/recommendation/index.ts` | Public export surface for the recommendation module. |
| `lib/recommendation/recommendation-engine.test-data.ts` | Test/example data for recommendation behavior. |

## Supabase And Server Files

| File | Role |
| --- | --- |
| `lib/supabase/server.ts` | Creates a server-only Supabase service-role client. Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. |
| `docs/supabase/module9-customers-assessments.sql` | Current main schema for `customers` and `assessments`; enables RLS. |
| `docs/supabase/module11-traffic-analytics.sql` | Adds UTM, landing page, and referrer columns to `assessments`. |
| `docs/supabase/module12-whatsapp-consent.sql` | Adds WhatsApp welcome/reply/opt-in fields to `customers`. |
| `docs/supabase/schema.sql` | Legacy `estimate_submissions` table schema. The current API writes `customers` and `assessments`, not this legacy table. |

## WhatsApp Files

| File | Role |
| --- | --- |
| `lib/whatsapp/client.ts` | Server-only WhatsApp Cloud API template client. Reads private WhatsApp env vars and returns `skipped` unless `WHATSAPP_ENABLED=true`. |
| `lib/whatsapp/sendWelcomeMessage.ts` | Server-only Module 12B welcome sender. Checks consent/status, avoids repeat welcomes, records safe audit fields, and calls the WhatsApp client. |
| `app/api/whatsapp/webhook/route.ts` | Verifies Meta webhook setup and records inbound replies against existing `customers.whatsapp` values. |
| `docs/whatsapp/testing.md` | Manual webhook and paused-send testing notes. |
| `docs/whatsapp/welcome-template.md` | Welcome template content/reference. |
| `docs/whatsapp/welcome-message.md` | Module 12B setup, enablement, testing, privacy, and limitation notes. |

WhatsApp welcome sending is enabled only when `WHATSAPP_ENABLED=true`, the Meta template is approved, env config exists, SQL has been applied, and the customer consent/status gate allows it.

## Analytics And Tracking Files

| File | Role |
| --- | --- |
| `lib/analytics/utm.ts` | Sanitizes UTM/source/query values, builds estimate links, builds `landing_page`, parses tracking context, and removes tracking params from the visible estimate URL. |
| `app/go/[source]/route.ts` | Converts clean campaign links into homepage UTM redirects. |
| `app/layout.tsx` | Mounts Vercel Web Analytics and Speed Insights. |
| `docs/analytics/README.md` | Notes on Vercel Analytics, Speed Insights, and Supabase campaign attribution. |
| `docs/marketing/tracking-links.md` | Full UTM campaign links. |
| `docs/marketing/launch-links.md` | Clean launch links and UTM mappings. |

Tracking is carried through URL query params and saved into `assessments`. The code does not add cookies or localStorage for UTM tracking.

## Docs Folder Structure

| Folder | Purpose |
| --- | --- |
| `docs/analytics` | Analytics and Speed Insights notes. |
| `docs/architecture` | Technical maps and architecture-level documentation. |
| `docs/marketing` | Campaign link references and launch tracking. |
| `docs/privacy` | Data inventory, data flow, app store readiness, and security/privacy checklist. |
| `docs/rebuild` | Rebuild blueprint for future developers or AI coding agents. |
| `docs/supabase` | SQL schema and migration references. |
| `docs/whatsapp` | WhatsApp testing and template documentation. |

## Environment Variables

Do not document or commit actual values.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public-safe Supabase project URL, also read server-side | Supabase endpoint used by the server service client. The value is public-safe, but it still identifies the project. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only secret | Supabase service role key used by API routes to insert/update protected tables. Never expose in client code. |
| `WHATSAPP_ACCESS_TOKEN` | Server-only secret | Meta WhatsApp Cloud API access token. Required only if WhatsApp sending is enabled. |
| `WHATSAPP_PHONE_NUMBER_ID` | Server-only config | Meta phone number ID used by the Cloud API messages endpoint. |
| `WHATSAPP_VERIFY_TOKEN` | Server-only secret/config | Token used to verify the Meta webhook callback URL. |
| `WHATSAPP_API_VERSION` | Server-only config | Meta Graph API version. Defaults to the client default if unset. |
| `WHATSAPP_WELCOME_TEMPLATE_NAME` | Server-only config | Approved WhatsApp template name for welcome messages. |
| `WHATSAPP_WELCOME_TEMPLATE_LANGUAGE` | Server-only config | Approved WhatsApp template language for welcome messages. |
| `WHATSAPP_ENABLED` | Server-only feature flag | Must remain `false` until production WhatsApp consent and setup are complete. When false, sends are skipped. |
| `NODE_ENV` | Build/runtime provided by framework | Used by `next-pwa` configuration to disable PWA behavior in development. |

## Plain-Language Flow

### Visitor Lands On The Homepage

The homepage renders the header, hero, and footer. If the visitor arrived with UTM/source query params, `app/page.tsx` sanitizes those values through `lib/analytics/utm.ts` and builds the `Start My Free Estimate` link so the tracking values follow the visitor into `/estimate`.

### Visitor Clicks Start My Free Estimate

The button opens `/estimate` with safe UTM/source values and a `landing_page` value. `/estimate` parses those values and gives them to `EstimateFlow` as initial tracking context.

### Answers Move Through The Flow

`EstimateFlow` keeps answers in local React state. The visitor answers goal, appliances, runtime, budget, timeline, name, WhatsApp number, and optional email. The flow validates each step before continuing. If `Other` is selected for appliances, the visitor must provide the custom appliance text.

### Recommendation Is Generated

When the final step is complete, `EstimateFlow` calls `getRecommendation`. The engine normalizes labels into stable IDs, groups appliance loads, chooses one of the current starter bands, maps timeline into a journey stage, and returns system labels plus plain-language explanation text.

Current recommendation bands:

- `12v_starter`
- `24v_home_essentials`
- `48v_larger_backup`

### Submission Is Saved

After generating the recommendation, the client POSTs the completed payload to `/api/estimate-submissions`. The API validates required fields, normalizes the Jamaican WhatsApp number, resolves the customer by `customers.whatsapp`, updates or creates the customer, marks old assessments for that customer as `is_latest=false`, then inserts the new `assessments` row as `is_latest=true`.

### Tracking Is Preserved

UTM/source/landing/referrer values are sanitized and included in the same API payload. They are saved on the `assessments` row, not in cookies or localStorage. The estimate page removes tracking params from the visible browser URL after loading.

### WhatsApp Welcome Gate

The save route calls the Module 12B welcome sender after the customer and assessment rows save. The sender only sends when `WHATSAPP_ENABLED=true`, required WhatsApp config exists, the customer has an allowed consent/status value, and no customer-level welcome timestamp exists. Current safe production behavior remains `WHATSAPP_ENABLED=false`, so estimates still save while WhatsApp skips. The webhook can still record inbound replies if Meta sends them.
