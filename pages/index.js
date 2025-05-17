import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import isAuthenticated from '../utils/isAuthenticated';
import { motion } from 'framer-motion';
import { ArrowRightIcon, UserPlusIcon } from '@heroicons/react/24/solid';

const Index = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/dashboard');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-5xl font-extrabold text-indigo-800 mb-4"
      >
        Welcome to the Leads Portal
      </motion.h1>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-lg text-gray-700 max-w-xl mb-8"
      >
        Manage, assign, and convert your leads efficiently with real-time tracking and team collaboration.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/login')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-md font-medium shadow"
        >
          <ArrowRightIcon className="w-5 h-5" />
          Login
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/register')}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-md font-medium shadow"
        >
          <UserPlusIcon className="w-5 h-5" />
          Register
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Index;
