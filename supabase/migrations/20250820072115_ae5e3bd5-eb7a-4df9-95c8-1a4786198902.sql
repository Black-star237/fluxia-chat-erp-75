-- Drop the existing restrictive INSERT policy on companies
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;

-- Create a more permissive policy for company creation
CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND created_by = auth.uid()
);