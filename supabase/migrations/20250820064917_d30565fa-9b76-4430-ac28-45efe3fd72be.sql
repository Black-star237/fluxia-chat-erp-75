-- FluxiaBiz Complete Database Schema
-- Created for comprehensive ERP management

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE public.app_role AS ENUM ('owner', 'manager', 'employee');
CREATE TYPE public.stock_movement_type AS ENUM ('in', 'out', 'transfer', 'adjustment');
CREATE TYPE public.sale_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'mobile_money', 'bank_transfer', 'check');
CREATE TYPE public.promotion_type AS ENUM ('percentage', 'fixed_amount', 'buy_x_get_y');

-- 1. USER MANAGEMENT TABLES

-- User profiles extending auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    company_id UUID,
    position TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles system
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    granted_by UUID REFERENCES public.profiles(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Granular permissions
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    module TEXT NOT NULL, -- 'stocks', 'sales', 'clients', 'reports', etc.
    action TEXT NOT NULL, -- 'read', 'write', 'delete', 'admin'
    granted_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module, action)
);

-- 2. PRODUCT AND STOCK MANAGEMENT

-- Product categories with hierarchy
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES public.categories(id),
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers
CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    contact_person TEXT,
    tax_number TEXT,
    payment_terms INTEGER DEFAULT 30, -- days
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    category_id UUID REFERENCES public.categories(id),
    supplier_id UUID REFERENCES public.suppliers(id),
    cost_price DECIMAL(10,2) DEFAULT 0,
    selling_price DECIMAL(10,2) NOT NULL,
    min_stock_level INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'piece', -- piece, kg, liter, etc.
    tax_rate DECIMAL(5,2) DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    has_variants BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants (sizes, colors, etc.)
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Size: Large", "Color: Red"
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    current_stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock movements tracking
CREATE TABLE public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    movement_type stock_movement_type NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2),
    reference_id UUID, -- sale_id, purchase_id, etc.
    reference_type TEXT, -- 'sale', 'purchase', 'adjustment'
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory alerts
CREATE TABLE public.inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id),
    alert_type TEXT NOT NULL, -- 'low_stock', 'out_of_stock', 'expired'
    threshold_value INTEGER,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES public.profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CLIENT MANAGEMENT

-- Clients
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    email TEXT,
    phone TEXT UNIQUE,
    tax_number TEXT,
    client_type TEXT DEFAULT 'individual', -- 'individual', 'company'
    credit_limit DECIMAL(10,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 0, -- days
    is_active BOOLEAN DEFAULT true,
    total_purchases DECIMAL(10,2) DEFAULT 0,
    last_purchase_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client addresses
CREATE TABLE public.client_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    address_type TEXT DEFAULT 'billing', -- 'billing', 'shipping'
    street_address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Cameroun',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client notes and interactions
CREATE TABLE public.client_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    note_type TEXT DEFAULT 'general', -- 'general', 'complaint', 'feedback'
    is_important BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client categories for segmentation
CREATE TABLE public.client_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SALES AND INVOICING

-- Sales transactions
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_number TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES public.clients(id),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method,
    status sale_status DEFAULT 'pending',
    notes TEXT,
    sold_by UUID REFERENCES public.profiles(id),
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale items
CREATE TABLE public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    variant_id UUID REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    line_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    sale_id UUID REFERENCES public.sales(id),
    client_id UUID REFERENCES public.clients(id),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    status invoice_status DEFAULT 'draft',
    payment_terms TEXT,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments tracking
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id),
    sale_id UUID REFERENCES public.sales(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reference_number TEXT,
    notes TEXT,
    processed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promotions and discounts
CREATE TABLE public.promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    promotion_type promotion_type NOT NULL,
    value DECIMAL(10,2) NOT NULL, -- percentage or fixed amount
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    usage_limit INTEGER,
    times_used INTEGER DEFAULT 0,
    applicable_categories UUID[] DEFAULT '{}',
    applicable_products UUID[] DEFAULT '{}',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ANALYTICS AND REPORTING

-- Daily aggregated statistics
CREATE TABLE public.daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_date DATE NOT NULL UNIQUE,
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    total_items_sold INTEGER DEFAULT 0,
    average_sale_value DECIMAL(10,2) DEFAULT 0,
    new_clients INTEGER DEFAULT 0,
    total_profit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly reports
CREATE TABLE public.monthly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_month DATE NOT NULL, -- first day of month
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_profit DECIMAL(10,2) DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    new_clients INTEGER DEFAULT 0,
    top_selling_products JSONB DEFAULT '[]',
    revenue_by_category JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KPI metrics tracking
CREATE TABLE public.kpi_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT, -- 'sales', 'inventory', 'clients', 'finance'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CONFIGURATION AND SETTINGS

-- Company settings
CREATE TABLE public.company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    tax_number TEXT,
    logo_url TEXT,
    currency TEXT DEFAULT 'FCFA',
    timezone TEXT DEFAULT 'Africa/Douala',
    fiscal_year_start DATE DEFAULT '2024-01-01',
    default_tax_rate DECIMAL(5,2) DEFAULT 19.25,
    invoice_template TEXT DEFAULT 'standard',
    receipt_template TEXT DEFAULT 'thermal',
    auto_backup BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax rates configuration
CREATE TABLE public.tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supported currencies
CREATE TABLE public.currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- 'FCFA', 'USD', 'EUR'
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    exchange_rate DECIMAL(10,4) DEFAULT 1,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. AI CHAT AND COMMUNICATION

-- AI conversation sessions
CREATE TABLE public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    context_data JSONB DEFAULT '{}', -- store relevant business context
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual AI messages
CREATE TABLE public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}', -- store additional context like generated charts, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. FILE MANAGEMENT

-- File uploads tracking
CREATE TABLE public.file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    storage_path TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id),
    entity_type TEXT, -- 'product', 'client', 'invoice', etc.
    entity_id UUID,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product images specific table
CREATE TABLE public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    file_id UUID REFERENCES public.file_uploads(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_supplier ON public.products(supplier_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_sales_date ON public.sales(sale_date);
CREATE INDEX idx_sales_client ON public.sales(client_id);
CREATE INDEX idx_sales_status ON public.sales(status);
CREATE INDEX idx_sale_items_product ON public.sale_items(product_id);
CREATE INDEX idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_date ON public.stock_movements(created_at);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_payments_date ON public.payments(payment_date);
CREATE INDEX idx_clients_phone ON public.clients(phone);
CREATE INDEX idx_daily_stats_date ON public.daily_stats(stat_date);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER FUNCTIONS TO AVOID RLS RECURSION
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role AS $$
DECLARE
    user_role app_role;
BEGIN
    SELECT role INTO user_role
    FROM public.user_roles
    WHERE user_id = user_uuid
    ORDER BY 
        CASE role 
            WHEN 'owner' THEN 1
            WHEN 'manager' THEN 2
            WHEN 'employee' THEN 3
        END
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'employee');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.has_permission(user_uuid UUID, module_name TEXT, action_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role app_role;
    has_perm BOOLEAN;
BEGIN
    -- Get user role
    user_role := public.get_user_role(user_uuid);
    
    -- Owners have all permissions
    IF user_role = 'owner' THEN
        RETURN TRUE;
    END IF;
    
    -- Check specific permission
    SELECT EXISTS(
        SELECT 1 FROM public.permissions 
        WHERE user_id = user_uuid 
        AND module = module_name 
        AND action = action_name
    ) INTO has_perm;
    
    RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS POLICIES

-- Profiles: Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles: Based on hierarchy
CREATE POLICY "Users can view roles" ON public.user_roles
    FOR SELECT USING (
        public.get_user_role(auth.uid()) IN ('owner', 'manager') OR 
        user_id = auth.uid()
    );

CREATE POLICY "Owners can manage all roles" ON public.user_roles
    FOR ALL USING (public.get_user_role(auth.uid()) = 'owner');

-- General business data policies (simplified for now)
CREATE POLICY "Authenticated users can access business data" ON public.categories
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access suppliers" ON public.suppliers
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access products" ON public.products
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access clients" ON public.clients
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can access sales" ON public.sales
    FOR ALL USING (auth.uid() IS NOT NULL);

-- AI conversations: Users can only access their own
CREATE POLICY "Users can access own conversations" ON public.ai_conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own messages" ON public.ai_messages
    FOR ALL USING (
        EXISTS(
            SELECT 1 FROM public.ai_conversations 
            WHERE ai_conversations.id = ai_messages.conversation_id 
            AND ai_conversations.user_id = auth.uid()
        )
    );

-- TRIGGERS FOR AUTOMATION

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data ->> 'first_name',
        NEW.raw_user_meta_data ->> 'last_name'
    );
    
    -- Assign default employee role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'employee');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update stock when sale is completed
CREATE OR REPLACE FUNCTION public.update_stock_on_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Update product stock
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Decrease stock for all items in the sale
        UPDATE public.products 
        SET current_stock = current_stock - sale_items.quantity
        FROM public.sale_items
        WHERE sale_items.sale_id = NEW.id 
        AND sale_items.product_id = products.id;
        
        -- Create stock movement records
        INSERT INTO public.stock_movements (product_id, movement_type, quantity, reference_id, reference_type, created_by)
        SELECT 
            product_id, 
            'out', 
            quantity, 
            NEW.id, 
            'sale',
            NEW.sold_by
        FROM public.sale_items 
        WHERE sale_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_on_sale_completion
    AFTER UPDATE ON public.sales
    FOR EACH ROW EXECUTE FUNCTION public.update_stock_on_sale();

-- Generate sale numbers automatically
CREATE OR REPLACE FUNCTION public.generate_sale_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sale_number IS NULL THEN
        NEW.sale_number = 'SALE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('sale_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS sale_number_seq;

CREATE TRIGGER generate_sale_number_trigger
    BEFORE INSERT ON public.sales
    FOR EACH ROW EXECUTE FUNCTION public.generate_sale_number();

-- Generate invoice numbers automatically
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number = 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS invoice_number_seq;

CREATE TRIGGER generate_invoice_number_trigger
    BEFORE INSERT ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();

-- Update client last purchase date and total
CREATE OR REPLACE FUNCTION public.update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE public.clients 
        SET 
            last_purchase_date = NEW.sale_date,
            total_purchases = COALESCE(total_purchases, 0) + NEW.total_amount
        WHERE id = NEW.client_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_stats_trigger
    AFTER UPDATE ON public.sales
    FOR EACH ROW EXECUTE FUNCTION public.update_client_stats();

-- Create low stock alerts
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if stock went below minimum level
    IF NEW.current_stock <= NEW.min_stock_level AND NEW.min_stock_level > 0 THEN
        INSERT INTO public.inventory_alerts (product_id, alert_type, threshold_value)
        VALUES (NEW.id, 'low_stock', NEW.min_stock_level)
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_low_stock_trigger
    AFTER UPDATE OF current_stock ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.check_low_stock();

-- Insert default data
INSERT INTO public.tax_rates (name, rate, is_default) VALUES 
    ('TVA Standard', 19.25, true),
    ('Exonéré', 0.00, false);

INSERT INTO public.currencies (code, name, symbol, is_default) VALUES 
    ('FCFA', 'Franc CFA', 'FCFA', true),
    ('USD', 'US Dollar', '$', false),
    ('EUR', 'Euro', '€', false);

INSERT INTO public.client_categories (name, description, discount_percentage) VALUES 
    ('Particulier', 'Clients particuliers', 0),
    ('Professionnel', 'Clients professionnels', 5),
    ('VIP', 'Clients privilégiés', 10);

-- Initial company settings (will be customized by users)
INSERT INTO public.company_settings (
    company_name, 
    currency, 
    default_tax_rate,
    created_by
) VALUES (
    'Ma Boutique FluxiaBiz',
    'FCFA',
    19.25,
    (SELECT id FROM auth.users LIMIT 1) -- Will be updated when first user registers
);