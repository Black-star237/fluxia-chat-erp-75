import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasCompany, setHasCompany] = useState<boolean | null>(null);
  const [checkingCompany, setCheckingCompany] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkUserCompanies();
    }
  }, [user, loading, navigate]);

  const checkUserCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .limit(1);

      if (error) throw error;

      const hasAnyCompany = data && data.length > 0;
      setHasCompany(hasAnyCompany);

      // Only redirect to company-setup if we're not already there
      if (!hasAnyCompany && location.pathname !== '/company-setup') {
        navigate('/company-setup');
      }
    } catch (error) {
      console.error('Error checking user companies:', error);
      setHasCompany(false);
      // Only redirect to company-setup if we're not already there
      if (location.pathname !== '/company-setup') {
        navigate('/company-setup');
      }
    } finally {
      setCheckingCompany(false);
    }
  };

  if (loading || checkingCompany) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If user has no company but is on company-setup page, allow access
  if (hasCompany === false && location.pathname === '/company-setup') {
    return <>{children}</>;
  }

  if (hasCompany === false) {
    return null; // Will redirect to company-setup
  }

  return <>{children}</>;
};

export default ProtectedRoute;