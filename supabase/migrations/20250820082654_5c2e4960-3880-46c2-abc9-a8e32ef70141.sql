-- Supprimer toutes les politiques RLS problématiques sur companies
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;
DROP POLICY IF EXISTS "Company owners can update their companies" ON public.companies;
DROP POLICY IF EXISTS "Allow company creation for authenticated users" ON public.companies;

-- Créer des politiques simples pour companies
CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view companies they created" 
ON public.companies 
FOR SELECT 
TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Users can update companies they created" 
ON public.companies 
FOR UPDATE 
TO authenticated
USING (created_by = auth.uid());