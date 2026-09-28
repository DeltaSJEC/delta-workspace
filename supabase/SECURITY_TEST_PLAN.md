# Security acceptance test plan

Run these checks in a non-production Supabase project after applying migrations
001 through 005. Use separate member accounts in different departments and two
head accounts. Execute both the UI flow and direct PostgREST/Storage requests
with each user's JWT; UI route guards are not authorization tests.

| Test | Expected result |
| --- | --- |
| Member updates `public.users.role` or `department` directly | Rejected by RLS |
| Public signup with `role: head` metadata | Profile is created as `member` |
| Member reads a project-file object for a hidden project | Rejected by Storage RLS |
| Head deletes another head's project-file object | Rejected by Storage RLS |
| Member uploads, reads, or deletes another member's submission object | Rejected by Storage RLS |
| Member writes a comment, reaction, or submission to a hidden project ID | Rejected by RLS |
| Owner head creates and deletes an attachment | Succeeds and metadata/object stay consistent |
| Member creates a valid submission for a visible project | Succeeds; author and owning head can download it |
| Member submits a file over 50 MB or with an unsupported MIME type | Rejected in UI and by bucket/DB constraints |
| Client supplies forged login time or duration | Database trigger replaces it with server-derived values |

Record the Supabase project reference, migration timestamps, tester identities,
and results before promoting a deployment. Rotate the service-role key after any
test environment that receives it is retired.
