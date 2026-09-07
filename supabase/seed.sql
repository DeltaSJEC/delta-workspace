-- ============================================================
-- Seed: Sample users for Delta SJEC Virtual Workspace
-- Run AFTER migrations 001, 002, 003 are applied.
--
-- NOTE: This only seeds public.users rows.
-- Actual auth.users must be created via the Supabase Auth Admin API
-- (use the seed script: scripts/seed-users.js)
-- ============================================================

-- These will be inserted automatically via the trigger when auth users are created.
-- Below is for reference only — run scripts/seed-users.js to create auth accounts.

-- Sample user data:
-- | Name              | Email                        | Role   | Department  | Club-wide |
-- |-------------------|------------------------------|--------|-------------|-----------|
-- | Sanmith S J       | sanmith@delta.sjec.ac.in     | head   | Computing   | true      |
-- | Priya Shetty      | priya@delta.sjec.ac.in       | head   | Electronics | false     |
-- | Rohan Nair        | rohan@delta.sjec.ac.in       | member | Mechanical  | false     |
-- | Aishwarya Kamath  | aishwarya@delta.sjec.ac.in   | member | Media       | false     |
-- | Vivek Prabhu      | vivek@delta.sjec.ac.in       | member | Computing   | false     |
-- | Divya Rao         | divya@delta.sjec.ac.in       | member | Electronics | false     |

SELECT 'Run scripts/seed-users.js to create auth accounts and seed users.' AS instructions;
