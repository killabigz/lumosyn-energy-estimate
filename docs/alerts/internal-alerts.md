# Lumosyn Internal Alerts

Module 20 adds a lightweight server-side alert foundation for new estimate
submissions. After a customer and assessment save successfully, Lumosyn can send
a short internal notification so Daniel knows there is a new lead to review.

Alerts are optional and disabled by default. Full customer details stay in the
protected `/hq` workspace.

## Environment Variables

Do not commit real values.

| Variable | Default | Notes |
| --- | --- | --- |
| `INTERNAL_ALERTS_ENABLED` | `false` | Set to `true` only when alerts are ready. |
| `INTERNAL_ALERTS_PROVIDER` | `ntfy` | Currently only `ntfy` is supported. |
| `NTFY_SERVER_URL` | empty | Base URL for the ntfy-compatible server, such as `https://ntfy.sh`. |
| `NTFY_TOPIC` | empty | Notification topic. Public topics should be unguessable or protected. |
| `NTFY_ACCESS_TOKEN` | empty | Optional bearer token for protected ntfy servers/topics. |
| `NEXT_PUBLIC_HQ_URL` | empty | Optional public-safe link to `/hq`. Do not put secrets in this value. |

## ntfy Setup

1. Choose a ntfy-compatible server.
2. Create a private, unguessable, or protected topic.
3. Set `NTFY_SERVER_URL` to the server base URL.
4. Set `NTFY_TOPIC` to the topic name.
5. Set `NTFY_ACCESS_TOKEN` only if the topic or server requires bearer auth.
6. Set `INTERNAL_ALERTS_ENABLED=true` after configuration is ready.

The alert client sends a plain text HTTP `POST` to the configured ntfy topic. If
`NTFY_ACCESS_TOKEN` is present, it is sent as a bearer token from the server
only.

## Privacy Behavior

Alert payloads intentionally avoid full customer private data. They may include:

- Recommendation title
- Broad source, such as `tiktok`, `direct`, or `web_estimate`
- Journey stage
- Selected appliance names with counts
- A link to `/hq` when configured

Alert payloads must not include:

- Full customer name
- WhatsApp number
- Internal notes
- Exact budget
- Private follow-up information

The protected `/hq` page remains the place to review full lead/customer details.
This keeps public notification topics and third-party notification systems from
becoming a second customer database.

## Failure Behavior

Alert sending is best effort. If alerts are disabled, configuration is missing,
the ntfy server returns an error, or the request times out, the estimate save
still succeeds.

## Testing Steps

- With `INTERNAL_ALERTS_ENABLED=false`, submit an estimate and confirm the save
  still succeeds with no notification attempt required.
- With `INTERNAL_ALERTS_ENABLED=true` and missing ntfy config, submit an
  estimate and confirm the save still succeeds while the server logs only a
  minimal warning.
- With temporary ntfy config, submit an estimate and confirm the notification
  contains only the privacy-safe fields listed above.
- Confirm `/hq` still loads under Basic Auth.
- Confirm public routes `/`, `/go/tiktok`, and `/estimate` still work.

## Current Limitations

- Only new estimate submission alerts are implemented.
- Only ntfy-compatible HTTP alerts are supported.
- Alerts are not retried after failure.
- Alert delivery is not stored in Supabase.

## Future Alert Types

- High-priority lead
- Follow-up due
- No leads in X days
- WhatsApp YES reply
- System error
