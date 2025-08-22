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
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-semibold text-blue-700"
        >
          <BriefcaseIcon className="w-7 h-7 text-blue-600" />
          <span className="hidden sm:inline">Leads Portal</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-5">
          {isAuthenticated && loggedInUser?.role !== 'admin' && (
            <NotificationBell />
          )}

          {isAuthenticated ? (
            <>
              <span className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                {userName}
              </span>

              {loggedInUser?.role !== 'admin' && (
                <Link
                  href="/dashboard"
                  className="text-slate-700 hover:text-blue-600"
                >
                  Dashboard
                </Link>
              )}

              {/* Reset Password link: visible to all logged-in users */}
              <Link
                href={loggedInUser?.role === 'developer' ? '/developer-reset' : '#'}
                className={`${
                  loggedInUser?.role === 'developer'
                    ? 'text-slate-700 hover:text-blue-600'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                Reset Password
              </Link>

              {!isProfilePage && (
                <Link
                  href="/profile"
                  className="text-slate-700 hover:text-blue-600"
                >
                  Profile
                </Link>
              )}

              {!isFilterLeadsPage && (
                <Link
                  href="/filter-leads"
                  className="text-slate-700 hover:text-blue-600"
                >
                  Filter Leads
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="text-slate-700 hover:text-blue-600"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="text-slate-700 hover:text-blue-600"
              >
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="sm:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? (
              <XMarkIcon className="w-6 h-6 text-slate-700" />
            ) : (
              <Bars3Icon className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden flex flex-col gap-3 px-4 py-3 border-t border-slate-200 bg-white">
          {isAuthenticated && loggedInUser?.role !== 'admin' && (
            <NotificationBell />
          )}
          {isAuthenticated ? (
            <>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full w-fit">
                {userName}
              </span>

              <Link
                href="/dashboard"
                className="text-slate-700 hover:text-blue-600"
              >
                Dashboard
              </Link>

              {/* Reset Password link: visible to all */}
              <Link
                href={loggedInUser?.role === 'developer' ? '/developer-reset' : '#'}
                className={`${
                  loggedInUser?.role === 'developer'
                    ? 'text-slate-700 hover:text-blue-600'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                Reset Password
              </Link>

              <Link
                href="/profile"
                className="text-slate-700 hover:text-blue-600"
              >
                Profile
              </Link>

              <Link
                href="/filter-leads"
                className="text-slate-700 hover:text-blue-600"
              >
                Filter Leads
              </Link>

              <button onClick={handleLogout} className="text-red-500 text-left">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register"
                className="text-slate-700 hover:text-blue-600"
              >
                Register
              </Link>
              <Link
                href="/login"
                className="text-slate-700 hover:text-blue-600"
              >
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
