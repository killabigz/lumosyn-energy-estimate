# Lead Cleanup

Module 21 adds safe lead cleanup through Archive.

## Archive

Archive hides an assessment from the normal HQ latest leads list.

Archive does not:

- Delete the customer.
- Delete the assessment.
- Merge duplicate customers.
- Remove the assessment from Supabase.

Archived assessments are marked with:

- `assessments.is_archived=true`
- `assessments.archived_at`
- `assessments.archived_reason` when a reason is supplied

The default `/hq` latest leads view loads only active, non-archived
assessments.

## Restore

Module 21 includes a protected restore server action that can set:

- `is_archived=false`
- `archived_at=null`
- `archived_reason=null`

If a restore UI is not visible in the default HQ view, Daniel can restore a
record manually in Supabase after confirming the assessment ID.

```sql
update public.assessments
set is_archived = false,
    archived_at = null,
    archived_reason = null
where id = '<assessment-id>';
```

## Permanent Delete

Permanent delete is intentionally not included yet.

Deletion needs a separate retention and data-request workflow because customer
and assessment rows contain contact information and estimate context.
