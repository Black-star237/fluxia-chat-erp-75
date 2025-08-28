-- Debug: Test auth context
SELECT 
    auth.uid() as current_auth_uid,
    auth.role() as current_auth_role,
    '6c6907c5-79c6-4b7d-8e7d-1cc0099f9ae5'::uuid = auth.uid() as uid_matches;