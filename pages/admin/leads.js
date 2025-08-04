import { useEffect, useState } from 'react';
import axios from 'axios';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import BASE_URL from '../../utils/api';
import { FaUser, FaUserTie, FaPhoneAlt, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const LeadsPage = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchUserAndLeads = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        setLoggedInUser(userRes.data);

        const leadsRes = await axios.get(`${BASE_URL}/api/leads/all`, { headers });
        setLeads(leadsRes.data);
      } catch (err) {
        console.error("Error loading data", err);
      }
    };

    fetchUserAndLeads();
  }, []);

  if (loggedInUser && loggedInUser.role !== 'admin') {
    return <div className="text-red-500 text-center mt-10 font-bold">🚫 Access Denied: Admins Only</div>;
  }

  const filteredLeads = leads.filter(
    (lead) =>
      lead.createdBy?.name?.toLowerCase().includes(search.toLowerCase()) ||
      lead.leadDetails?.clientName?.toLowerCase().includes(search.toLowerCase())
  );

  const count = filteredLeads.length;
  const lead = filteredLeads[index] || null;

  const handlePrev = () => setIndex((prev) => (prev === 0 ? count - 1 : prev - 1));
  const handleNext = () => setIndex((prev) => (prev === count - 1 ? 0 : prev + 1));

  return (
    <ProtectedRoute>
      <Navbar loggedInUser={loggedInUser} />
      
      {/* Positioned Button */}
      <div className="p-4">
        <Link href='/admin/AdminDashboard'>
          <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-semibold shadow-md transition duration-300">
            🚀 Go to Admin Dashboard
          </button>
        </Link>
      </div>

      <div className="p-6 bg-white min-h-screen">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">📋 All Leads</h1>

        <input
          type="text"
          placeholder="🔍 Search by client or user name..."
          className="border px-3 py-2 rounded w-full sm:w-80 mb-6 shadow"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIndex(0); // reset to first result
          }}
        />

        {count === 0 ? (
          <div className="italic text-gray-400">No matching leads found.</div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={handlePrev} className="bg-indigo-100 hover:bg-indigo-200 px-4 py-2 rounded shadow">
                ⬅️ Prev
              </button>
              <span className="text-indigo-700 font-medium">{index + 1} / {count}</span>
              <button onClick={handleNext} className="bg-indigo-100 hover:bg-indigo-200 px-4 py-2 rounded shadow">
                Next ➡️
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={lead._id}
                className="bg-gradient-to-br from-indigo-50 via-white to-pink-50 rounded-2xl p-6 shadow-xl border border-indigo-100 max-w-xl"
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-lg font-bold text-indigo-700 flex items-center gap-2">
                    <FaUserTie /> {lead.leadDetails?.clientName || 'N/A'}
                  </div>
                  <div className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium">
                    {lead.status || 'N/A'}
                  </div>
                </div>

                <div className="text-sm space-y-2 text-gray-700">
                  <div className="flex items-center gap-2">
                    <FaUser className="text-indigo-400" />
                    <span className="font-medium">Created By:</span> {lead.createdBy?.name || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhoneAlt className="text-pink-400" />
                    <span className="font-medium">Phone:</span>{' '}
                    {Array.isArray(lead.leadDetails?.contacts)
                      ? lead.leadDetails.contacts.map((c, i) => (
                          <span key={i} className="mr-2">{c.number}</span>
                        ))
                      : lead.leadDetails?.contact || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <FaBuilding className="text-green-400" />
                    <span className="font-medium">Company:</span> {lead.leadDetails?.companyName || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-blue-400" />
                    <span className="font-medium">Location:</span> {lead.leadDetails?.location || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Email:</span> {lead.leadDetails?.email || 'N/A'}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default LeadsPage;
