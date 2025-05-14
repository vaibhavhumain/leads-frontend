import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import isAuthenticated from '../utils/isAuthenticated';
import { motion } from 'framer-motion';

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
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-4xl font-extrabold text-gray-800 mb-8"
      >
        Welcome to the Leads Portal
      </motion.h1>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="space-x-4"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/login')}
          className="bg-blue-500 text-white px-6 py-2 rounded shadow-lg hover:bg-blue-600 transition"
        >
          Login
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/register')}
          className="bg-green-500 text-white px-6 py-2 rounded shadow-lg hover:bg-green-600 transition"
        >
          Register
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Index;
