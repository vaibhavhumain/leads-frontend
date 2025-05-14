import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import LeadTable from '../components/LeadTable';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import LeadForm from '../components/LeadForm';
import { motion } from 'framer-motion';
import BASE_URL from '../utils/api';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);

  const formRef = useRef(null);

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Unauthorized: Please log in.');
          setLoading(false);
          return;
        }

       const response = await axios.get(`${BASE_URL}/api/leads`, {
  headers: { Authorization: `Bearer ${token}` },
});


        if (response.data.length === 0) {
          setError('No leads found.');
        } else {
          setLeads(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const handleLeadCreated = (newLead) => {
    setLeads((prevLeads) => [...prevLeads, newLead]);
    setIsLeadFormOpen(false);
  };

  const handleOpenLeadForm = () => {
    setIsLeadFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <motion.div
        className="container mx-auto p-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-3xl font-bold mb-4"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Dashboard
        </motion.h1>

        <motion.button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          onClick={handleOpenLeadForm}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Click to create Lead
        </motion.button>

        {loading && (
          <motion.p
            className="text-blue-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Loading leads...
          </motion.p>
        )}
        {error && !loading && (
          <motion.p
            className="text-red-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <LeadTable leads={leads} setLeads={setLeads} />
          </motion.div>
        )}

        {isLeadFormOpen && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <LeadForm
              closeModal={() => setIsLeadFormOpen(false)}
              onLeadCreated={handleLeadCreated}
            />
          </motion.div>
        )}
      </motion.div>
    </ProtectedRoute>
  );
};

export default Dashboard;
