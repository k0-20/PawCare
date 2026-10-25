/*
# Revoke anon access from user_preferences and in_app_notifications

## Summary
The anon role retained CRUD grants on the two new tables. This migration
explicitly revokes all privileges from anon so unauthenticated requests
are denied at the database level.

## Security Changes
- REVOKE SELECT, INSERT, UPDATE, DELETE from anon on user_preferences
- REVOKE SELECT, INSERT, UPDATE, DELETE from anon on in_app_notifications
*/

REVOKE SELECT, INSERT, UPDATE, DELETE ON user_preferences FROM anon;
REVOKE SELECT, INSERT, UPDATE, DELETE ON in_app_notifications FROM anon;
