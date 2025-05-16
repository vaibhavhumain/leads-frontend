import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import BASE_URL from '../utils/api';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const emojis = [
  '😄', '😁', '😎', '🤩', '🥳', '😇', '😊', '🙌', '👋', '👍',
  '🔥', '🚀', '✨', '🎯', '🏆', '🌟', '🌈', '💫', '💡', '📈',
  '📊', '🧠', '💪', '🤝', '👨‍💻', '👩‍💻', '🧑‍💻', '🛠️', '🧰', '🧭',
  '🎓', '🎉', '🎁', '📣', '📌', '🗂️', '💼', '🚌', '🚍', '🕶️',
  '🏁', '🔑', '⚡', '📍', '📝', '🧾', '🕹️', '🛎️', '🪄', '🏅',
  '😎', '🚀', '🎉', '🌟', '🔥', '👋', '💼', '🚌', '😁', '✨','🕺🏾'
];
  const [randomEmoji, setRandomEmoji] = useState('');


  
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
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" legacyBehavior>
          <a className="text-xl font-bold">Leads Portal</a>
        </Link>
        <div className="flex space-x-4 items-center">
          {isAuthenticated ? (
            <>
             <span className="font-semibold">Welcome, {userName} {randomEmoji}</span>
              <Link href="/dashboard" legacyBehavior>
                <a>Dashboard</a>
              </Link>
              <Link href="/profile" legacyBehavior>
                <a>Profile</a>
              </Link>
              <button onClick={handleLogout} className="hover:underline bg-red-500 text-white px-4 py-2 rounded">
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
