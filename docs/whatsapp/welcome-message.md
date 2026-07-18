# WhatsApp Welcome Message

Module 12B activates a single consent-based WhatsApp welcome template after a successful estimate submission. It does not add reminders, AI replies, marketing sequences, public lead APIs, or client-side customer reads.

## Meta Template

Use this approved Meta WhatsApp template:

```text
lumosyn_welcome_message
```

Language:

```text
en_US
```

Expected body:

```text
Hi {{1}}, thanks for using Lumosyn.

Your energy estimate has been received. Lumosyn helps you understand your backup options before making a decision.

You can reply here if you want help understanding the next step.
```

`{{1}}` is the customer's first/display name. If no safe name is available, the sender uses `there`.

## Environment Variables

Keep real values only in local server env files or Vercel environment variables.

```env
WHATSAPP_ENABLED=false
WHATSAPP_API_VERSION=v21.0
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_WELCOME_TEMPLATE_NAME=lumosyn_welcome_message
WHATSAPP_WELCOME_TEMPLATE_LANGUAGE=en_US
```

`WHATSAPP_ENABLED` must stay `false` until the Meta template is approved, production env values are present, and the consent/status process is ready.

## Meta Setup

1. Open Meta WhatsApp Manager for the registered Lumosyn phone number.
2. Create a utility or customer-care template named `lumosyn_welcome_message`.
3. Set the template language to `en_US`.
4. Add the exact body above with one body variable, `{{1}}`.
5. Submit the template for approval and wait until Meta marks it approved.
6. Add `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, template name, template language, and API version to Vercel.
7. Deploy once with `WHATSAPP_ENABLED=false`, then enable only after the SQL migration has been applied.

## Send Behavior

- Estimate submission always saves first.
- The welcome sender runs server-side after the customer and assessment rows are saved.
- Sending is skipped while `WHATSAPP_ENABLED=false`.
- Sending is skipped if required WhatsApp config is missing.
- Sending is skipped when the customer has no allowed WhatsApp consent/status.
- `community_status` values `pending`, `joined`, `allowed`, and `opted_in` are treated as allowed for this welcome. `opted_out` and unknown values are not.
- A customer-level `whatsapp_welcome_sent_at` timestamp prevents repeat welcome spam.
- The message contains only the safe template greeting and no private estimate details.
- Send failures do not change the public API response and do not break estimate submission.

## Database Setup

Apply:

```text
docs/supabase/module12b-whatsapp-welcome-message.sql
```

This keeps the welcome audit on `customers`:

- `whatsapp_welcome_sent_at`
- `whatsapp_welcome_status`
- `whatsapp_welcome_error`
- `whatsapp_opt_in_source`

## Testing

1. Run `npm run lint`.
2. Run `npm run build`.
3. With `WHATSAPP_ENABLED=false`, submit an estimate and confirm the estimate saves while WhatsApp skips.
4. With `WHATSAPP_ENABLED=true` and missing WhatsApp config, submit an estimate and confirm the estimate still saves.
5. In a safe mocked or staging environment, confirm the Meta request body uses:
   - `messaging_product: "whatsapp"`
   - `recipient_type: "individual"`
   - `type: "template"`
   - template name `lumosyn_welcome_message`
   - language code `en_US`
   - body parameter `{{1}}` as the first/display name or `there`
6. Confirm a second submission for the same customer skips when `whatsapp_welcome_sent_at` is already set.
7. Confirm `/hq` remains protected and public routes such as `/`, `/estimate`, and `/go/tiktok` still render or redirect.

## Privacy Rules

- WhatsApp tokens stay server-side only.
- Do not commit `.env.local`.
- Do not put WhatsApp secrets in `NEXT_PUBLIC_` variables.
- Do not expose customer/lead data through public APIs.
- Do not read or write customer data from client-side Supabase.
- Do not send recommendations, budgets, internal notes, HQ links, or private estimate details in the welcome message.
- Do not send when a customer has opted out.

## Limitations

- This module sends only the first welcome template.
- It does not automate replies.
- It does not add reminders or campaigns.
- It does not add AI responses.
- It does not replace the Meta webhook verification and inbound reply tracking from Module 12.
