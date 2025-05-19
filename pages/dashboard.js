import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import LeadTable from '../components/LeadTable';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import LeadForm from '../components/LeadForm';
import { FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import BASE_URL from '../utils/api';

const Dashboard = () => {
  const [myLeads, setMyLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [loginDuration, setLoginDuration] = useState('');

  const formRef = useRef(null);

  // Fetch initial leads
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(`${BASE_URL}/api/leads/my-leads`, { headers });
        setMyLeads(response.data);
        setFilteredLeads(response.data); // Default view is my leads
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();

    const interval = setInterval(() => {
      const loginTimeString = localStorage.getItem('loginTime');
      if (loginTimeString) {
        const loginTime = new Date(loginTimeString);
        const now = new Date();
        const diff = now - loginTime;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        let duration = '';
        if (hours > 0) duration += `${hours}h `;
        if (minutes > 0 || hours > 0) duration += `${minutes}m `;
        duration += `${seconds}s`;

        setLoginDuration(duration.trim());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Search logic (backend API)
  useEffect(() => {
  const fetchSearchResults = async () => {
    if (!searchTerm.trim()) {
      setFilteredLeads(myLeads); // fallback to own leads
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        alert('Session expired. Please log in again.');
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/api/leads/search?phone=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFilteredLeads(response.data);
    } catch (err) {
      console.error('Search error:', err);

      if (err.response?.status === 401) {
        alert('Unauthorized access. Please log in again.');
      } else {
        alert('Something went wrong while searching.');
      }

      setFilteredLeads([]);
    } finally {
      setLoading(false);
    }
  };

  fetchSearchResults();
}, [searchTerm, myLeads]);


  const handleLeadCreated = (newLead) => {
    setMyLeads((prev) => [...prev, newLead]);
    setFilteredLeads((prev) => [...prev, newLead]);
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
        <div className="relative flex justify-center items-center mb-6">
          <motion.h1
            className="text-4xl font-extrabold text-blue-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Dashboard
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute right-0 bg-green-100 text-green-700 px-4 py-1 rounded-full shadow text-sm font-medium"
          >
            ⏱️ Logged in: <span className="font-bold">{loginDuration}</span>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="mb-4 flex items-center space-x-3">
          <motion.button
            onClick={() => setSearchVisible((prev) => !prev)}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow"
            whileTap={{ scale: 0.95 }}
          >
            <FiSearch size={18} />
          </motion.button>

          {!searchVisible && (
            <span className="ml-4 text-sm text-gray-700 font-medium">Search Leads</span>
          )}

          <AnimatePresence>
            {searchVisible && (
              <motion.input
                key="search-input"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '16rem', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                type="text"
                autoFocus
                placeholder="Search by phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded shadow-sm text-sm focus:ring w-64 origin-left"
              />
            )}
          </AnimatePresence>

          {searchVisible && searchTerm && (
            <motion.button
              onClick={() => setSearchTerm('')}
              whileTap={{ scale: 0.9 }}
              className="text-gray-500 hover:text-red-500 text-xs transition"
            >
              Clear
            </motion.button>
          )}
        </div>

        {!loading && !error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="bg-white rounded-lg shadow-md p-4 overflow-auto">
              <LeadTable leads={filteredLeads} setLeads={setMyLeads} searchTerm={searchTerm} />
            </div>
          </motion.div>
        )}

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

        <motion.button
          onClick={handleOpenLeadForm}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-lg z-50 text-sm font-semibold"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          + New Lead
        </motion.button>
      </motion.div>
    </ProtectedRoute>
  );
};

export default Dashboard;
