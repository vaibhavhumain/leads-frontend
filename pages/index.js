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
    <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 min-h-screen w-full text-center">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center justify-center h-screen px-6"
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

      {/* Features Section */}
      <section className="py-16 bg-white px-6">
        <h2 className="text-3xl font-bold text-indigo-700 mb-10">Why Use Our Lead Portal?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { title: "Track in Real-Time", desc: "Monitor lead status updates instantly." },
            { title: "Forward with Context", desc: "Assign leads to teammates with full history." },
            { title: "Easy Follow-ups", desc: "Add reminders, notes, and next steps." },
          ].map((item, i) => (
            <div key={i} className="bg-indigo-50 rounded-lg p-6 shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-2 text-indigo-800">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 px-6">
        <h2 className="text-3xl font-bold text-indigo-800 mb-10">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-center gap-10 max-w-5xl mx-auto text-left">
          {[
            "Sign up and log in to your dashboard.",
            "Add or receive leads and update their status.",
            "Assign leads to team members with full history.",
            "Track progress and convert efficiently.",
          ].map((step, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="text-indigo-600 font-bold text-2xl">{i + 1}</div>
              <p className="text-gray-700 text-md">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials or CTA */}
      <section className="py-16 bg-white px-6">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Trusted by 50+ sales teams across India</h2>
        <p className="text-gray-600 max-w-3xl mx-auto mb-8">
          Our system has helped businesses streamline lead workflows and boost conversion by 30%.
        </p>
        <button
          onClick={() => router.push('/register')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg rounded-md shadow"
        >
          Start Managing Leads Today
        </button>
      </section>
      {/* 👇 Copyright */}
  <footer className="w-full text-center py-6 text-sm text-gray-600 bg-transparent">
  © Akash-Vaibhav 2025
  </footer>

    </div>
  );
};

export default Index;
