# Customer Identity

Module 21 makes customer identity phone-first.

## Rule

Phone number is stronger than name.

If the normalized WhatsApp or phone number already exists, Lumosyn reuses the
existing `customers` row and saves the new form as another `assessments` row
for that customer.

If the normalized phone number does not exist, Lumosyn creates a new customer
and saves the first assessment under that customer.

## Expected Behavior

- Same phone number means same customer.
- One customer can have many assessments.
- Names can change between estimate submissions.
- A repeated estimate should not aggressively overwrite an existing real name.
- `customers.phone_normalized` stores the internal digits-only identity value
  used for matching.

## Existing Duplicates

Module 21 does not automatically merge old duplicate customer rows.

Existing duplicates may remain until Daniel reviews them manually. The Module
21 SQL file includes diagnostic queries for finding duplicate
`phone_normalized` values and reviewing the affected customer IDs, names,
WhatsApp numbers, and timestamps.

A manual merge workflow can become a later module after the cleanup rules are
fully safe.

## Data Audit

- Customer identity data remains internal.
- `phone_normalized` is derived customer contact data and must be treated as
  personal contact information.
- No public customer identity lookup was added.
- No client-side Supabase customer or lead read/write was added.
- `lead_assessments` remains an internal/server-side HQ view only.
