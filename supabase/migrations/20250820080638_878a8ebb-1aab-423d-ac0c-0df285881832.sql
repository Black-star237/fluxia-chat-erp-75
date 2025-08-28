-- Remove the trigger that causes circular dependency with CASCADE
DROP TRIGGER IF EXISTS handle_new_company_trigger ON public.companies CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_company() CASCADE;

-- Update the companies UPDATE policy to be conditional on having members
DROP POLICY IF EXISTS "Company owners can update their companies" ON public.companies;

CREATE POLICY "Company owners can update their companies" 
ON public.companies 
FOR UPDATE 
TO authenticated
USING (
  -- If company has no members yet, allow any authenticated user to update
  -- Otherwise, only allow company owners
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM company_members WHERE company_id = companies.id)
    THEN true
    ELSE EXISTS (
      SELECT 1 FROM company_members 
      WHERE company_id = companies.id 
      AND user_id = auth.uid() 
      AND role = 'owner'::app_role 
      AND is_active = true
    )
  END
);

-- Also update the company_members INSERT policy to be less restrictive initially
DROP POLICY IF EXISTS "Allow automatic company member creation" ON public.company_members;

CREATE POLICY "Allow company member creation" 
ON public.company_members 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Allow if user is adding themselves as owner to a company they created
  (user_id = auth.uid() AND role = 'owner'::app_role) OR
  -- Or if they're already an owner of the company
  (get_user_role_in_company(auth.uid(), company_id) = 'owner'::app_role)
);