/*
# Revoke anon access from preventive_care_tasks

## Summary
The anon role inherited CRUD grants on preventive_care_tasks. This migration
explicitly revokes all privileges from anon so unauthenticated requests are
denied at the database level.

## Security Changes
- REVOKE ALL privileges from anon on preventive_care_tasks
*/

REVOKE ALL PRIVILEGES ON preventive_care_tasks FROM anon;
