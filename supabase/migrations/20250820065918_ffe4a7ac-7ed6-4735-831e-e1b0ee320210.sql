-- Correction du système multi-entreprises
-- 1. Créer la table des entreprises
CREATE TABLE public.companies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    tax_number TEXT,
    currency TEXT DEFAULT 'FCFA',
    timezone TEXT DEFAULT 'Africa/Douala',
    default_tax_rate NUMERIC DEFAULT 19.25,
    fiscal_year_start DATE DEFAULT '2024-01-01',
    subscription_plan TEXT DEFAULT 'standard',
    subscription_status TEXT DEFAULT 'active',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Créer la table des membres d'entreprise (relation many-to-many avec rôles)
CREATE TABLE public.company_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role app_role NOT NULL DEFAULT 'employee',
    permissions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    invited_by UUID,
    UNIQUE(company_id, user_id)
);

-- 3. Ajouter company_id aux tables principales pour isoler les données
ALTER TABLE public.categories ADD COLUMN company_id UUID;
ALTER TABLE public.clients ADD COLUMN company_id UUID;
ALTER TABLE public.products ADD COLUMN company_id UUID;
ALTER TABLE public.suppliers ADD COLUMN company_id UUID;
ALTER TABLE public.sales ADD COLUMN company_id UUID;
ALTER TABLE public.invoices ADD COLUMN company_id UUID;
ALTER TABLE public.daily_stats ADD COLUMN company_id UUID;
ALTER TABLE public.monthly_reports ADD COLUMN company_id UUID;
ALTER TABLE public.kpi_metrics ADD COLUMN company_id UUID;
ALTER TABLE public.promotions ADD COLUMN company_id UUID;
ALTER TABLE public.inventory_alerts ADD COLUMN company_id UUID;
ALTER TABLE public.ai_conversations ADD COLUMN company_id UUID;

-- 4. Supprimer l'ancienne table company_settings et le company_id dans profiles
DROP TABLE IF EXISTS public.company_settings;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS company_id;

-- 5. Créer des index pour les performances
CREATE INDEX idx_company_members_company_id ON public.company_members(company_id);
CREATE INDEX idx_company_members_user_id ON public.company_members(user_id);
CREATE INDEX idx_categories_company_id ON public.categories(company_id);
CREATE INDEX idx_clients_company_id ON public.clients(company_id);
CREATE INDEX idx_products_company_id ON public.products(company_id);
CREATE INDEX idx_suppliers_company_id ON public.suppliers(company_id);
CREATE INDEX idx_sales_company_id ON public.sales(company_id);
CREATE INDEX idx_invoices_company_id ON public.invoices(company_id);

-- 6. Activer RLS sur les nouvelles tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- 7. Fonctions utilitaires pour la gestion multi-entreprises
CREATE OR REPLACE FUNCTION public.get_user_companies(user_uuid UUID)
RETURNS TABLE(company_id UUID, company_name TEXT, user_role app_role)
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
    SELECT cm.company_id, c.name, cm.role
    FROM public.company_members cm
    JOIN public.companies c ON c.id = cm.company_id
    WHERE cm.user_id = user_uuid AND cm.is_active = true AND c.is_active = true;
$$;

CREATE OR REPLACE FUNCTION public.user_has_company_access(user_uuid UUID, comp_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
    SELECT EXISTS(
        SELECT 1 FROM public.company_members 
        WHERE user_id = user_uuid 
        AND company_id = comp_id 
        AND is_active = true
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role_in_company(user_uuid UUID, comp_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
    SELECT role FROM public.company_members 
    WHERE user_id = user_uuid 
    AND company_id = comp_id 
    AND is_active = true
    LIMIT 1;
$$;

-- 8. Politiques RLS pour les entreprises
CREATE POLICY "Users can view their companies" 
ON public.companies 
FOR SELECT 
USING (
    EXISTS(
        SELECT 1 FROM public.company_members 
        WHERE company_id = companies.id 
        AND user_id = auth.uid() 
        AND is_active = true
    )
);

CREATE POLICY "Company owners can update their companies" 
ON public.companies 
FOR UPDATE 
USING (
    EXISTS(
        SELECT 1 FROM public.company_members 
        WHERE company_id = companies.id 
        AND user_id = auth.uid() 
        AND role = 'owner' 
        AND is_active = true
    )
);

CREATE POLICY "Authenticated users can create companies" 
ON public.companies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 9. Politiques RLS pour les membres d'entreprise
CREATE POLICY "Users can view company members of their companies" 
ON public.company_members 
FOR SELECT 
USING (
    user_has_company_access(auth.uid(), company_id)
);

CREATE POLICY "Company owners can manage members" 
ON public.company_members 
FOR ALL 
USING (
    get_user_role_in_company(auth.uid(), company_id) = 'owner'
);

CREATE POLICY "Users can view their own memberships" 
ON public.company_members 
FOR SELECT 
USING (user_id = auth.uid());

-- 10. Trigger pour ajouter automatiquement le créateur comme owner
CREATE OR REPLACE FUNCTION public.handle_new_company()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Ajouter le créateur comme propriétaire de l'entreprise
    INSERT INTO public.company_members (company_id, user_id, role, invited_by)
    VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_company_created
    AFTER INSERT ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_company();

-- 11. Mise à jour des politiques RLS existantes pour inclure company_id
-- Categories
DROP POLICY IF EXISTS "Authenticated users can access business data" ON public.categories;
CREATE POLICY "Users can access categories in their companies" 
ON public.categories 
FOR ALL 
USING (user_has_company_access(auth.uid(), company_id));

-- Clients
DROP POLICY IF EXISTS "Authenticated users can access clients" ON public.clients;
CREATE POLICY "Users can access clients in their companies" 
ON public.clients 
FOR ALL 
USING (user_has_company_access(auth.uid(), company_id));

-- Products
DROP POLICY IF EXISTS "Authenticated users can access products" ON public.products;
CREATE POLICY "Users can access products in their companies" 
ON public.products 
FOR ALL 
USING (user_has_company_access(auth.uid(), company_id));

-- Suppliers
DROP POLICY IF EXISTS "Authenticated users can access suppliers" ON public.suppliers;
CREATE POLICY "Users can access suppliers in their companies" 
ON public.suppliers 
FOR ALL 
USING (user_has_company_access(auth.uid(), company_id));

-- Sales
DROP POLICY IF EXISTS "Authenticated users can access sales" ON public.sales;
CREATE POLICY "Users can access sales in their companies" 
ON public.sales 
FOR ALL 
USING (user_has_company_access(auth.uid(), company_id));

-- Trigger pour mettre à jour les timestamps
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();