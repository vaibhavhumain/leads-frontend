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
  Bars3Icon,
  XMarkIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/solid';

const Navbar = ({ loggedInUser }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const isProfilePage = router.pathname === '/profile';
  const isFilterLeadsPage = router.pathname === '/filter-leads';

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

        {/* Mobile Menu Toggle */}
        <div className="sm:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Desktop Links */}
        <div className="hidden sm:flex items-center gap-6 text-lg font-medium">
          {isAuthenticated && loggedInUser?.role !== 'admin' && <NotificationBell />}

          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline-block px-3 py-1 bg-white text-blue-800 rounded-full font-semibold">
                {userName}
              </span>

              {loggedInUser?.role !== 'admin' && (
                <Link href="/dashboard" legacyBehavior>
                  <a className="hover:underline">Dashboard</a>
                </Link>
              )}

              {!isProfilePage && (
                <Link href="/profile" legacyBehavior>
                  <a className="hover:underline">Profile</a>
                </Link>
              )}

              {!isFilterLeadsPage && (
                <Link href="/filter-leads" legacyBehavior>
                  <a className="hover:underline">Filter Leads</a>
                </Link>
              )}

              <button onClick={handleLogout} className="hover:underline text-red-200">
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

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden mt-4 flex flex-col gap-3 text-base font-medium px-2">
          {isAuthenticated && loggedInUser?.role !== 'admin' && <NotificationBell />}
          
          {isAuthenticated ? (
            <>
              <span className="px-3 py-1 bg-white text-blue-800 rounded-full font-semibold w-fit">
                {userName}
              </span>

              {loggedInUser?.role !== 'admin' && (
                <Link href="/dashboard" legacyBehavior>
                  <a className="hover:underline">Dashboard</a>
                </Link>
              )}

              {!isProfilePage && (
                <Link href="/profile" legacyBehavior>
                  <a className="hover:underline">Profile</a>
                </Link>
              )}

              {!isFilterLeadsPage && (
                <Link href="/filter-leads" legacyBehavior>
                  <a className="hover:underline">Filter Leads</a>
                </Link>
              )}

              <button onClick={handleLogout} className="hover:underline text-red-200 text-left">
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
      )}
    </nav>
  );
};

export default Navbar;
