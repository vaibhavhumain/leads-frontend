import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import BASE_URL from '../utils/api';
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
  const [randomEmoji, setRandomEmoji] = useState('');
  const router = useRouter();

  const emojis = [
    '😄', '😁', '😎', '🤩', '🥳', '😇', '😊', '🙌', '👋', '👍',
    '🔥', '🚀', '✨', '🎯', '🏆', '🌟', '🌈', '💫', '💡', '📈',
    '📊', '🧠', '💪', '🤝', '👨‍💻', '👩‍💻', '🧑‍💻', '🛠️', '🧰', '🧭',
    '🎓', '🎉', '🎁', '📣', '📌', '🗂️', '💼', '🚌', '🚍', '🕶️',
    '🏁', '🔑', '⚡', '📍', '📝', '🧾', '🕹️', '🛎️', '🪄', '🏅',
    '😎', '🚀', '🎉', '🌟', '🔥', '👋', '💼', '🚌', '😁', '✨',
    '🕺🏾', '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊',
    '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙',
    '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫',
    '🤐', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌',
    '😴', '🤤', '😪', '😵', '🤯', '🥴', '😷', '🤒', '🤕', '🫠',
  ];

useEffect(() => {
  const token = localStorage.getItem('token');

  if (!token) {
    setIsAuthenticated(false);
    router.push('/login');
    return;
  }

  axios.get(`${BASE_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(res => {
    setUserName(res.data.name || 'User');
    setIsAuthenticated(true);
    setRandomEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
  })
  .catch(err => {
    console.error('Failed to fetch user:', err);
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    router.push('/login');
  });
}, []);


  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Title */}
        <Link href="/" legacyBehavior>
          <a className="flex items-center gap-2 text-xl font-bold tracking-wide">
            <BriefcaseIcon className="w-6 h-6" />
            Leads Portal
          </a>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-5 text-sm font-medium">
          {isAuthenticated ? (
            <>
              {/* Avatar + Name */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white text-blue-700 font-bold flex items-center justify-center">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span>
                  {userName} {randomEmoji}
                </span>
              </div>

              {/* Dashboard */}
              {loggedInUser?.role !== 'admin' && (
  <Link href="/dashboard" legacyBehavior>
    <a className="flex items-center gap-1 px-3 py-1 rounded transition-all duration-200 ease-in-out hover:bg-yellow-500 hover:text-white hover:scale-105">
      <HomeIcon className="w-5 h-5" />
      <span className="hidden sm:inline">Dashboard</span>
    </a>
  </Link>
)}

              {/* Profile */}
              <Link href="/profile" legacyBehavior>
                <a className="flex items-center gap-1 px-3 py-1 rounded transition-all duration-200 ease-in-out hover:bg-blue-500 hover:text-white hover:scale-105">
                  <UserCircleIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Profile</span>
                </a>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1 rounded transition-all duration-200 ease-in-out bg-red-500 hover:bg-red-600 hover:scale-105"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Register */}
              <Link href="/register" legacyBehavior>
                <a className="flex items-center gap-1 px-3 py-1 rounded transition-all duration-200 ease-in-out hover:bg-blue-500 hover:text-white hover:scale-105">
                  <UserCircleIcon className="w-5 h-5" />
                  Register
                </a>
              </Link>
              <Link href="/gallery">
              </Link>
              {/* Login */}
              <Link href="/login" legacyBehavior>
                <a className="flex items-center gap-1 px-3 py-1 rounded transition-all duration-200 ease-in-out hover:bg-blue-500 hover:text-white hover:scale-105">
                  <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  Login
                </a>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
