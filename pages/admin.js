// pages/admin.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import LeadTable from '../components/LeadTable';
import BASE_URL from '../utils/api';
import { motion } from 'framer-motion';

const Admin = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const fetchAdminLeads = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // Get current user details
        const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        setLoggedInUser(userRes.data);

        // Fetch all leads for admin
        const res = await axios.get(`${BASE_URL}/api/leads/all`, { headers });
        setLeads(res.data);
      } catch (err) {
        console.error('Error fetching leads for admin:', err);
        setError('Failed to load leads');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminLeads();
  }, []);

  return (
    <ProtectedRoute>
      <Navbar loggedInUser={loggedInUser} />
      <div className="p-8">
        <motion.h1 className="text-4xl font-extrabold text-blue-600 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            Admin Dashboard
          </motion.h1>
       

        {loading ? (
          <p className="text-blue-500">Loading leads...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4 overflow-auto">
            <LeadTable
              leads={leads}
              setLeads={setLeads}
              searchTerm={searchTerm}
              loggedInUser={loggedInUser}
              isAdminTable={true}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
