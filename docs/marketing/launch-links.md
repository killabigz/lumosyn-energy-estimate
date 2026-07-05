# Lumosyn Launch Links

Use these clean links while the custom domain and real WhatsApp Cloud API phone number are paused.

Production base URL:

```text
https://lumosyn-energy-estimate.vercel.app
```

## Clean Campaign Links

| Link | Use for |
| --- | --- |
| `https://lumosyn-energy-estimate.vercel.app/go/tiktok` | TikTok bio |
| `https://lumosyn-energy-estimate.vercel.app/go/instagram` | Instagram bio |
| `https://lumosyn-energy-estimate.vercel.app/go/facebook` | Facebook posts |
| `https://lumosyn-energy-estimate.vercel.app/go/whatsapp` | WhatsApp status |
| `https://lumosyn-energy-estimate.vercel.app/go/direct` | Manual sharing, QR drafts, or direct typing |

## Hidden UTM Mapping

Each clean link redirects into `/estimate` with campaign tracking already attached.

| Clean link | Redirect target |
| --- | --- |
| `/go/tiktok` | `/estimate?utm_source=tiktok&utm_medium=bio&utm_campaign=launch_v1` |
| `/go/instagram` | `/estimate?utm_source=instagram&utm_medium=bio&utm_campaign=launch_v1` |
| `/go/facebook` | `/estimate?utm_source=facebook&utm_medium=post&utm_campaign=launch_v1` |
| `/go/whatsapp` | `/estimate?utm_source=whatsapp&utm_medium=status&utm_campaign=launch_v1` |
| `/go/direct` | `/estimate?utm_source=direct&utm_medium=manual&utm_campaign=launch_v1` |
| Unknown `/go/[source]` | `/estimate?utm_source=direct&utm_medium=unknown&utm_campaign=launch_v1` |

Existing tracking still preserves `utm_content`, `utm_term`, and `landing_page` when those values are present on supported estimate links.

## Lead Capture Test

- A. Open `/go/tiktok`
- B. Confirm it redirects to the estimate flow
- C. Complete one test estimate
- D. Confirm a customer row exists
- E. Confirm an assessment row exists
- F. Confirm source/tracking fields show:

```text
utm_source = tiktok
utm_medium = bio
utm_campaign = launch_v1
```

## Confirm Saved Rows In Supabase

In Supabase, open Table Editor and check:

- `customers`: a row exists for the submitted WhatsApp number.
- `assessments`: a latest row exists for that customer.
- `assessments.utm_source`, `assessments.utm_medium`, and `assessments.utm_campaign` match the launch link.

Optional SQL check:

```sql
select
  a.created_at,
  c.name,
  c.whatsapp,
  a.utm_source,
  a.utm_medium,
  a.utm_campaign,
  a.utm_content,
  a.utm_term,
  a.landing_page
from public.assessments a
join public.customers c on c.id = a.customer_id
order by a.created_at desc
limit 10;
```

## WhatsApp Paused Status

Real WhatsApp sending is paused until Lumosyn gets a dedicated WhatsApp Cloud API number.

Current safe status:

```env
WHATSAPP_ENABLED=false
```

This means:

- Estimates still save.
- Customers still enter a WhatsApp number.
- No automatic WhatsApp message is sent.
- Follow-up can happen later after Meta phone number setup is complete.
