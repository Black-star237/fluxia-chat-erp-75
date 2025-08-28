import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  banner_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export const useCurrentCompany = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const companyIdFromUrl = searchParams.get('company');

  useEffect(() => {
    const fetchCurrentCompany = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('company_members')
          .select(`
            company_id,
            companies (
              id,
              name,
              logo_url,
              banner_url,
              address,
              phone,
              email
            )
          `)
          .eq('user_id', user.id)
          .eq('is_active', true);

        // Si on a un ID d'entreprise dans l'URL, on le privilégie
        if (companyIdFromUrl) {
          query = query.eq('company_id', companyIdFromUrl);
        }

        const { data: membershipData, error: membershipError } = await query
          .limit(1)
          .maybeSingle();

        if (membershipError) {
          console.error('Error fetching company:', membershipError);
          setCompany(null);
        } else if (membershipData?.companies) {
          const companyData = membershipData.companies as any;
          setCompany({
            id: companyData.id,
            name: companyData.name,
            logo_url: companyData.logo_url,
            banner_url: companyData.banner_url,
            address: companyData.address,
            phone: companyData.phone,
            email: companyData.email,
          });
        }
      } catch (error) {
        console.error('Error:', error);
        setCompany(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentCompany();
  }, [user, companyIdFromUrl]);

  return { company, loading };
};