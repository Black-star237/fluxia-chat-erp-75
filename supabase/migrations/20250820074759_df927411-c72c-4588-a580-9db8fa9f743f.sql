-- Temporarily update the RLS policy to debug auth context
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;

-- Create a more permissive policy for testing
CREATE POLICY "Allow company creation for authenticated users"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (created_by IS NOT NULL);