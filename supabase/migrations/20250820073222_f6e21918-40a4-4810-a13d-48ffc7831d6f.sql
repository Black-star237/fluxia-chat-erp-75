-- Create the missing trigger on companies table to automatically add the creator as owner
CREATE TRIGGER handle_new_company_trigger
    AFTER INSERT ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_company();