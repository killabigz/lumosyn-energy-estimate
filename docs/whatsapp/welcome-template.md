# WhatsApp Welcome Template

Module 12B uses the WhatsApp Business Platform / Cloud API and sends only one approved welcome template message.

## Template Name

```text
lumosyn_welcome_message
```

## Template Language

```text
en_US
```

## Template Copy

```text
Hi {{1}}, thanks for using Lumosyn.

Your energy estimate has been received. Lumosyn helps you understand your backup options before making a decision.

You can reply here if you want help understanding the next step.
```

## Template Variables

`{{1}}` = customer first/display name, or `there` when no safe name exists.

## Production Note

This template must be created and approved in Meta WhatsApp Manager before production sending. Keep `WHATSAPP_ENABLED=false` until the template is approved, Module 12B SQL is applied, and production env values are set.
