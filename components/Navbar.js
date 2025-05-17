import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import BASE_URL from '../utils/api';
import {
  HomeIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/solid';

const Navbar = () => {
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
    if (token) {
      fetch(`${BASE_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => {
          if (!res.ok) throw new Error('Unauthorized');
          return res.json();
        })
        .then(data => {
          setUserName(data.name || 'User');
          setIsAuthenticated(true);
          setRandomEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
        })
        .catch(err => {
          console.error('Failed to fetch user:', err);
          setIsAuthenticated(false);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav className="bg-blue-600 px-4 py-3 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" legacyBehavior>
          <a className="text-xl font-bold tracking-wide">Leads Portal</a>
        </Link>

        <div className="flex space-x-6 items-center text-sm font-medium">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline-block font-semibold">
                Welcome, {userName} {randomEmoji}
              </span>

              <Link href="/dashboard" legacyBehavior>
                <a className="flex items-center gap-1 hover:text-yellow-200">
                  <HomeIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </a>
              </Link>

              <Link href="/profile" legacyBehavior>
                <a className="flex items-center gap-1 hover:text-yellow-200">
                  <UserCircleIcon className="w-5 h-5" />
                  <span className="hidden sm:inline">Profile</span>
                </a>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/register" legacyBehavior>
                <a className="flex items-center gap-1 hover:text-yellow-200">
                  <UserCircleIcon className="w-5 h-5" />
                  Register
                </a>
              </Link>

              <Link href="/login" legacyBehavior>
                <a className="flex items-center gap-1 hover:text-yellow-200">
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
