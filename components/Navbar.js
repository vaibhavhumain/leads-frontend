import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import BASE_URL from '../utils/api';
import NotificationBell from './NotificationBell';
import {
  BriefcaseIcon,
  Bars3Icon,
  XMarkIcon,
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
      return;
    }

    const storedUser = localStorage.getItem('userName');
    if (storedUser) {
      setUserName(storedUser);
      setIsAuthenticated(true);
      return;
    }

    axios
      .get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUserName(res.data.name || 'User');
        localStorage.setItem('userName', res.data.name || 'User');
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        setIsAuthenticated(false);
        router.push('/login');
      });
  }, []); 

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserName('');
    router.push('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center text-xl font-semibold gap-2">
          <BriefcaseIcon className="w-6 h-6 text-yellow-300" />
          Leads Portal
        </Link>

        {/* Mobile Menu Toggle */}
        <div className="sm:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
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
                <Link href="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
              )}

              {!isProfilePage && (
                <Link href="/profile" className="hover:underline">
                  Profile
                </Link>
              )}

              {!isFilterLeadsPage && (
                <Link href="/filter-leads" className="hover:underline">
                  Filter Leads
                </Link>
              )}

              <button onClick={handleLogout} className="hover:underline text-red-200">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className="hover:underline">
                Register
              </Link>
              <Link href="/login" className="hover:underline">
                Login
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
                <Link href="/dashboard" className="hover:underline">
                  Dashboard
                </Link>
              )}

              {!isProfilePage && (
                <Link href="/profile" className="hover:underline">
                  Profile
                </Link>
              )}

              {!isFilterLeadsPage && (
                <Link href="/filter-leads" className="hover:underline">
                  Filter Leads
                </Link>
              )}

              <button onClick={handleLogout} className="hover:underline text-red-200 text-left">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className="hover:underline">
                Register
              </Link>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
export default Navbar;
