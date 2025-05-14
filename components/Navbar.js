import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" legacyBehavior>
          <a className="text-xl font-bold">Leads Portal</a>
        </Link>
        <div className="flex space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" legacyBehavior>
                <a>Dashboard</a>
              </Link>
              <Link href="/profile" legacyBehavior>
                <a>Profile</a>
              </Link>
              <button onClick={handleLogout} className="hover:underline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/register" legacyBehavior>
                <a>Register</a>
              </Link>
              <Link href="/login" legacyBehavior>
                <a>Login</a>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
