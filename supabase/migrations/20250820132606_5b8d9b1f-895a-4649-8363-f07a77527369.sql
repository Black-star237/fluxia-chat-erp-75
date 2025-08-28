-- Add missing foreign key constraints
ALTER TABLE public.company_members 
ADD CONSTRAINT company_members_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.company_members 
ADD CONSTRAINT company_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;