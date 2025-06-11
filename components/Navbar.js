import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import BASE_URL from '../utils/api';
import NotificationBell from './NotificationBell'
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
  const [randomEmoji, setRandomEmoji] = useState('');

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
  setRandomEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
}, []);

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
  localStorage.removeItem('pausedSessions');
  localStorage.removeItem('totalLeadsUploaded');
  setTotalLeadsUploaded(0);
    router.push('/login');
  };

  return (
  <nav className="relative z-30 bg-gradient-to-br from-[#2b2469] via-[#3f51b5] to-[#8ec6f3] px-7 py-4 shadow-2xl border-b border-blue-200/30 backdrop-blur-md">
    {/* Glowing gold top accent */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-300 blur-[2px] opacity-70" />
    <div className="container mx-auto flex justify-between items-center relative">
      {/* Logo & Title */}
      <Link href="/" legacyBehavior>
        <a className="flex items-center gap-3 text-2xl font-extrabold tracking-wide bg-gradient-to-br from-yellow-300 via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-sm hover:scale-105 hover:drop-shadow-xl transition-all">
          <BriefcaseIcon className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
          Leads Portal
        </a>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-6 text-base font-semibold text-white">
        {isAuthenticated && loggedInUser?.role !== 'admin' && <NotificationBell />}

        {isAuthenticated ? (
          <>
            {/* Avatar & Name */}
            <div className="hidden sm:flex items-center gap-2 bg-white/20 px-3 py-1 rounded-xl shadow-inner border border-yellow-200/30">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-50 to-white text-blue-900 font-extrabold flex items-center justify-center border border-yellow-400/80 shadow">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-yellow-100 font-bold drop-shadow">
                {userName} {randomEmoji}
              </span>
            </div>
            {/* Dashboard */}
            {loggedInUser?.role !== 'admin' && (
              <Link href="/dashboard" legacyBehavior>
                <a className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-yellow-300/20 to-yellow-400/30 border border-yellow-300/20 text-yellow-100 shadow hover:from-yellow-200/40 hover:to-yellow-400/50 hover:scale-105 hover:text-yellow-50 transition-all">
                  <HomeIcon className="w-5 h-5 text-yellow-300" />
                  <span className="hidden sm:inline">Dashboard</span>
                </a>
              </Link>
            )}
            {/* Profile */}
            {!isProfilePage && (
              <Link href="/profile" legacyBehavior>
                <a className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-indigo-200/20 to-blue-200/10 border border-indigo-300/20 text-white hover:from-indigo-300/30 hover:to-blue-200/20 hover:scale-105 hover:text-yellow-50 transition-all">
                  <UserCircleIcon className="w-5 h-5 text-yellow-300" />
                  <span className="hidden sm:inline">Profile</span>
                </a>
              </Link>
            )}
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-rose-600/90 to-rose-500/70 text-white border border-rose-100/10 shadow hover:scale-105 hover:shadow-lg transition-all"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            {/* Register */}
            <Link href="/register" legacyBehavior>
              <a className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-white/30 to-yellow-100/40 border border-yellow-200/30 text-yellow-900 hover:from-yellow-200/70 hover:to-yellow-300/50 hover:scale-105 transition-all">
                <UserCircleIcon className="w-5 h-5 text-yellow-400" />
                Register
              </a>
            </Link>
            {/* Login */}
            <Link href="/login" legacyBehavior>
              <a className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-blue-100/40 to-white/20 border border-blue-200/20 text-blue-900 hover:from-blue-200/60 hover:to-yellow-100/30 hover:scale-105 transition-all">
                <ArrowLeftOnRectangleIcon className="w-5 h-5 text-indigo-500" />
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