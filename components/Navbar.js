import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode'; 

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    fetch('http://localhost:5000/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setUserName(data.name || 'User');
        setIsAuthenticated(true);
      })
      .catch(err => {
        console.error(err);
        setIsAuthenticated(false);
      });
  }
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
        <div className="flex space-x-4 items-center">
          {isAuthenticated ? (
            <>
              <span className="font-semibold">Welcome, {userName}</span>
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
