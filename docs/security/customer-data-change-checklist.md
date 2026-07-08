# Customer Data Change Checklist

Use this checklist before implementing any Lumosyn module that touches customer
or lead data.

## Data Audit

- [ ] What customer data does this touch?
- [ ] Where is it stored?
- [ ] Who can read it?
- [ ] Is it server-side only?
- [ ] Does it expose anything publicly?
- [ ] Does it require privacy/security docs update?
- [ ] Does it require retention/deletion/export consideration?
- [ ] Does it require new environment variables?
- [ ] Does it require token rotation?
- [ ] Does it affect App Store / Play Store privacy disclosures later?

## Approval Notes

- [ ] The change follows `docs/security/data-stewardship-rules.md`.
- [ ] No public lead/customer read API is added.
- [ ] No client-side Supabase customer/lead read is added.
- [ ] Any new secret is documented without exposing its value.
- [ ] Any temporary token seen in a screenshot or shared context is treated as
  exposed and not reused.
