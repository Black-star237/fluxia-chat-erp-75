-- Fix the companies INSERT policy to allow authenticated users to create companies
DROP POLICY IF EXISTS "Allow company creation for authenticated users" ON public.companies;

CREATE POLICY "Allow company creation for authenticated users" 
ON public.companies 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow any authenticated user to create a company if they set themselves as creator
  created_by = auth.uid()
);