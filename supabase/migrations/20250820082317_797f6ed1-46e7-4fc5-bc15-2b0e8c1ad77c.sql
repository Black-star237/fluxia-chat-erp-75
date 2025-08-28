-- Simplify the companies INSERT policy to allow any authenticated user to create companies
DROP POLICY IF EXISTS "Allow company creation for authenticated users" ON public.companies;

CREATE POLICY "Allow company creation for authenticated users" 
ON public.companies 
FOR INSERT 
TO authenticated
WITH CHECK (true);