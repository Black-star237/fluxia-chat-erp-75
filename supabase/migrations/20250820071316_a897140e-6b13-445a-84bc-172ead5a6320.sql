-- Create storage buckets for company assets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('company-logos', 'company-logos', true),
  ('company-banners', 'company-banners', true);

-- Add banner_url column to companies table (logo_url already exists)
ALTER TABLE public.companies 
ADD COLUMN banner_url TEXT;

-- Create RLS policies for company logos bucket
CREATE POLICY "Company logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-logos');

CREATE POLICY "Users can upload company logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'company-logos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update company logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'company-logos' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete company logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'company-logos' 
  AND auth.uid() IS NOT NULL
);

-- Create RLS policies for company banners bucket
CREATE POLICY "Company banners are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'company-banners');

CREATE POLICY "Users can upload company banners" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'company-banners' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update company banners" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'company-banners' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete company banners" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'company-banners' 
  AND auth.uid() IS NOT NULL
);