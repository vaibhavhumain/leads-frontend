import { useRouter } from 'next/router';
import { useEffect } from 'react';
import isAuthenticated from '../utils/isAuthenticated';

const ProtectedRoute = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  return <>{children}</>;
};

export default ProtectedRoute;
