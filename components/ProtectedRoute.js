import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import isAuthenticated from '../utils/isAuthenticated';
import BASE_URL from '../utils/api';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        const user = res.data;

        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
          router.push('/unauthorized');
        } else {
          setAuthorized(true);
        }
      } catch (err) {
        console.error("Error validating user:", err);
        router.push('/login');
      }
    };

    checkAccess();
  }, [router, allowedRoles]);

  if (!authorized) return null; 

  return <>{children}</>;
};

export default ProtectedRoute;
