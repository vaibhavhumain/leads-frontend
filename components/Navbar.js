import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import BASE_URL from '../utils/api';
import NotificationBell from './NotificationBell';
import {
  HomeIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/solid';

const Navbar = ({ loggedInUser }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const isProfilePage = router.pathname === '/profile';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      router.push('/login');
      return;
    }

    axios.get(`${BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => {
      setUserName(res.data.name || 'User');
      setIsAuthenticated(true);
    })
    .catch(() => {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      router.push('/login');
    });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
  <div className="max-w-7xl mx-auto flex justify-between items-center">
    {/* Logo */}
    <Link href="/" legacyBehavior>
      <a className="flex items-center text-xl font-semibold gap-2">
        <BriefcaseIcon className="w-6 h-6 text-yellow-300" />
        Leads Portal
      </a>
    </Link>

    {/* Links */}
    <div className="flex items-center gap-6 text-lg font-medium">
      {isAuthenticated && loggedInUser?.role !== 'admin' && <NotificationBell />}

      {isAuthenticated ? (
        <>
          {/* User name */}
          <span className="hidden sm:inline-block px-3 py-1 bg-white text-blue-800 rounded-full font-semibold">
            {userName}
          </span>

          {/* Dashboard link */}
          {loggedInUser?.role !== 'admin' && (
            <Link href="/dashboard" legacyBehavior>
              <a className="hover:underline">Dashboard</a>
            </Link>
          )}

          {/* Profile link */}
          {!isProfilePage && (
            <Link href="/profile" legacyBehavior>
              <a className="hover:underline">Profile</a>
            </Link>
          )}

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="hover:underline text-red-200"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link href="/register" legacyBehavior>
            <a className="hover:underline">Register</a>
          </Link>
          <Link href="/login" legacyBehavior>
            <a className="hover:underline">Login</a>
          </Link>
        </>
      )}
    </div>
  </div>
</nav>
  );
};

export default Navbar;
