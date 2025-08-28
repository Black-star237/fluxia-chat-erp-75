-- Add a policy to allow automatic insertion of company members by the trigger
CREATE POLICY "Allow automatic company member creation"
ON public.company_members
FOR INSERT
WITH CHECK (
  -- Allow insertion when it's done by the handle_new_company trigger
  -- (the user is creating a company and should be automatically added as owner)
  user_id = auth.uid() AND role = 'owner'
);