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

## Completed Module Notes

### Module 16: Appliance Quantities

- [x] Touches assessment data by adding `assessments.appliance_quantities`.
- [x] Stores selected appliance quantities as user-provided estimate context.
- [x] Access remains server-side/internal only through the existing estimate API and secured HQ data path.
- [x] No public lead API added.
- [x] No client-side Supabase customer/lead read added.
- [x] No new environment variables or secrets added.
- [x] Privacy, data-flow, rebuild, and Supabase documentation updated.

### Module 17: Quantity-Aware Recommendation Engine

- [x] Reads `appliance_quantities` for recommendation logic when present.
- [x] No new customer data field added.
- [x] No public lead API added.
- [x] No client-side customer/lead database read added.
- [x] No new environment variables or secrets added.
- [x] Privacy docs reviewed.

### Module 18: HQ Quantity Display

- [x] Reads existing `appliance_quantities` for HQ display only.
- [x] No new customer data field added.
- [x] No schema change added.
- [x] No public lead API added.
- [x] No client-side customer/lead read added.
- [x] Privacy/security docs reviewed.

### Module 19: Lead Follow-Up Controls

- [x] Adds internal follow-up fields to `assessments`.
- [x] Touches customer-linked data.
- [x] Access remains protected/server-side HQ only.
- [x] No public lead API added.
- [x] No client-side customer/lead Supabase read/write added.
- [x] Privacy docs updated.

### Module 19 Polish: Compact HQ CRM Controls

- [x] Changed CRM presentation only.
- [x] No new customer data fields added.
- [x] No public lead API added.
- [x] No client-side customer/lead database read/write added.
