# WhatsApp Welcome & Consent Testing

## Required Environment Variables

Set these on Vercel and in local server-only env files when testing live sends:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_API_VERSION=v21.0
WHATSAPP_WELCOME_TEMPLATE_NAME=lumosyn_welcome_message
WHATSAPP_WELCOME_TEMPLATE_LANGUAGE=en_US
WHATSAPP_ENABLED=false
```

Do not expose WhatsApp values with `NEXT_PUBLIC_`.

## Safe Production Sending Gate

Real WhatsApp sending is blocked unless the feature flag, SQL, Meta template, phone number, access token, and customer consent/status gate are ready.

Current safe status:

```env
WHATSAPP_ENABLED=false
```

This means estimates still save, customers still enter a WhatsApp number, no automatic WhatsApp message is sent, and follow-up can happen later after Meta phone number setup is complete.

For Module 12B live-send testing, apply `docs/supabase/module12b-whatsapp-welcome-message.sql`, create the approved `lumosyn_welcome_message` template in Meta with language `en_US`, set Vercel env values, and then enable `WHATSAPP_ENABLED=true`.

## Webhook Callback URL

After deployment, set the Meta webhook callback URL to:

```text
https://lumosyn-energy-estimate.vercel.app/api/whatsapp/webhook
```

Use the value from `WHATSAPP_VERIFY_TOKEN` as the Meta verify token.

## Webhook Verification

A correct verification request returns the challenge as plain text:

```text
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=<WHATSAPP_VERIFY_TOKEN>&hub.challenge=test-challenge
```

Expected response:

```text
test-challenge
```

A wrong verify token returns `403`.

## Local POST Body: YES

Use a sender number that matches an existing `customers.whatsapp` row after normalization. For this example, Meta sends `18765550123`, which matches stored customer WhatsApp `8765550123`.

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "18765550123",
                "timestamp": "1720000000",
                "text": {
                  "body": "YES"
                },
                "type": "text"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

Expected database update:

```text
community_status = joined
whatsapp_last_reply = YES
whatsapp_last_reply_at = current server time
```

## Local POST Body: NO

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "18765550123",
                "timestamp": "1720000300",
                "text": {
                  "body": "NO"
                },
                "type": "text"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

Expected database update:

```text
community_status = opted_out
whatsapp_last_reply = NO
whatsapp_last_reply_at = current server time
```

## Other Replies

Any other text reply stores:

```text
whatsapp_last_reply = original reply text
whatsapp_last_reply_at = current server time
```

It does not change `community_status`.

## Unknown Customers

If no customer matches the normalized sender number, the webhook still returns `200` and does not crash.
