import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import BASE_URL from '../utils/api';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });

      const { token } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('loginTime', new Date().toISOString());

      const profileRes = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem('user', JSON.stringify(profileRes.data));

      setTimeout(() => {  // small delay to show animation
        if (profileRes.data.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#c2e9fb] via-[#a1c4fd] to-[#fbc2eb]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/40 relative"
      >
        {!loading ? (
          <>
            <h2 className="text-4xl font-extrabold text-center text-indigo-700 drop-shadow-sm">
              Welcome Back 👋
            </h2>
            <p className="text-center text-sm text-gray-500 mt-2 mb-6">
              Please login to access your dashboard
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/60 placeholder-gray-400"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/60 placeholder-gray-400"
                required
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-md transition duration-300"
              >
                Sign In
              </button>
            </form>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600 text-center mt-4 text-sm font-medium"
              >
                {error}
              </motion.p>
            )}

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">Don't have an account?</p>
              <button
                onClick={() => router.push('/register')}
                className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium transition"
              >
                Create Account
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            {/* Funny loading animation */}
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-6xl"
            >
              🐼
            </motion.div>
            <p className="mt-4 text-indigo-700 font-semibold">
              Logging you in... Please wait 😸
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
