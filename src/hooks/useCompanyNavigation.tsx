import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useCompanyNavigation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const companyId = searchParams.get('company');

  const navigateTo = useCallback((path: string) => {
    if (companyId) {
      const separator = path.includes('?') ? '&' : '?';
      navigate(`${path}${separator}company=${companyId}`);
    } else {
      navigate(path);
    }
  }, [navigate, companyId]);

  const buildUrl = useCallback((path: string) => {
    if (companyId) {
      const separator = path.includes('?') ? '&' : '?';
      return `${path}${separator}company=${companyId}`;
    }
    return path;
  }, [companyId]);

  return { navigateTo, buildUrl, companyId };
};