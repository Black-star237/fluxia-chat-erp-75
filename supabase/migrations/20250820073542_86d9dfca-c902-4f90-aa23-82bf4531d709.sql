-- Temporarily add debug logging to see what's happening with the INSERT
-- Let's check if there are any issues with the authentication context

-- First, let's see the current user and test the INSERT policy
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    auth.jwt() is not null as has_jwt;