import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BASE_URL from '../utils/api'; 
import { HomeIcon } from '@heroicons/react/24/solid';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import { PhoneIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [forwardedLeads, setForwardedLeads] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const router = useRouter();
  const [dropdownVisible, setDropdownVisible] = useState({});
  const [searchTerm , setSearchTerm] = useState('');

  const statusOptions = ['Hot', 'Warm', 'Cold'];
  
  useEffect(() => {
  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/leads/forwarded-to-me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const leads = response.data;

      if (leads.length > 0 && leads[0].forwardedTo?.user) {
        setUser(leads[0].forwardedTo.user); // 👈 use first forwarded user's data
      } else {
        toast.warning('No forwarded leads, user info fallback unavailable');
      }
    } catch (error) {
      console.error('Error fetching forwarded leads:', error);
      toast.error('Failed to load user info');
    } finally {
      setLoadingUser(false);
    }
  };

  fetchUser();
}, [router]);


  useEffect(() => {
  const fetchForwardedLeads = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        `${BASE_URL}/api/leads/forwarded-to-me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const sortedLeads = response.data.sort((a, b) => {
        const dateA = new Date(a.forwardedTo?.forwardedAt || a.updatedAt || a.createdAt);
        const dateB = new Date(b.forwardedTo?.forwardedAt || b.updatedAt || b.createdAt);
        return dateB - dateA;
      });

      setForwardedLeads(sortedLeads);
    } catch (err) {
      console.error('Error fetching forwarded leads:', err);
      toast.error('Failed to load leads');
    } finally {
      setLoadingLeads(false);
    }
  };

  fetchForwardedLeads();
}, []);


  const handleStatusUpdate = async (e, leadId) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const { status, remarks, date } = statusUpdates[leadId] || {};

  if (!status || !remarks || !date) {
    toast.warning('Please fill out all fields');
    return;
  }

  try {
    await axios.put(
  `${BASE_URL}/api/leads/${leadId}/status`,
      { status, remarks, date },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success('Lead updated successfully');
    // Optional: clean up the statusUpdates entry
    setStatusUpdates((prev) => {
      const updated = { ...prev };
      delete updated[leadId];
      return updated;
    });

  } catch (err) {
    console.error('Error updating lead:', err);
    toast.error('Failed to update lead');
  }
};

const toggleDropdown = (leadId) => {
  setDropdownVisible((prev) => ({
    ...prev,
    [leadId]: !prev[leadId],
  }));
};


const filteredLeads = searchTerm
  ? forwardedLeads.filter((lead) =>
      (lead.leadDetails?.contacts || [])
        .some(c =>
          c.number?.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''))
        )
    )
  : forwardedLeads;

return (
  <ProtectedRoute>
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-200 to-indigo-300">
      <ToastContainer />
      <Navbar />

      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-[-90px] left-[-90px] w-[270px] h-[270px] bg-purple-300 opacity-40 rounded-full blur-3xl z-0"
        animate={{ y: [0, 50, 0], x: [0, 60, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[-120px] right-[-120px] w-[320px] h-[320px] bg-indigo-400 opacity-30 rounded-full blur-3xl z-0"
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 15, repeat: Infinity }}
      />

      <div className="relative z-10 w-full px-4 py-10 md:px-8">
        <motion.h1
          className="text-5xl font-extrabold mb-7 text-center bg-gradient-to-br from-indigo-700 via-fuchsia-500 to-blue-400 bg-clip-text text-transparent drop-shadow-lg"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Sales Profile
        </motion.h1>

        <motion.h2
  className="
    relative
    text-3xl md:text-4xl font-extrabold tracking-tight
    mb-10 text-center text-transparent
    bg-clip-text bg-gradient-to-r from-indigo-700 via-blue-500 to-emerald-400
    drop-shadow-xl
  "
  initial={{ opacity: 0, x: -25 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: 0.2, duration: 0.6 }}
>
  <span className="inline-flex items-center gap-2">
    🚀
    <span>Leads Forwarded To Me</span>
    🌟
  </span>
  <span
    className="
      block mx-auto mt-3 w-24 h-1 rounded-full
      bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-300
      blur-[1px] opacity-70 shadow-lg
    "
  ></span>
</motion.h2>


        {/* Search */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ boxShadow: '0 1px 6px 0 rgba(99,102,241,0.08)' }}
            whileFocus={{
              boxShadow:
                '0 0 0 3px rgba(99,102,241,0.23), 0 6px 24px 0 rgba(99,102,241,0.08)',
              scale: 1.01,
            }}
            className="relative w-full max-w-sm"
          >
            <PhoneIcon className="w-5 h-5 text-indigo-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Phone Number"
              className="pl-10 pr-10 py-3 border-2 border-indigo-300 rounded-xl shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white/90 text-gray-800 w-full font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              maxLength={15}
              style={{ transition: 'box-shadow 0.3s' }}
            />
            {/* Clear (X) button */}
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full hover:bg-gray-100 p-1 transition"
                aria-label="Clear search"
                tabIndex={-1}
              >
                <XCircleIcon className="w-5 h-5 text-gray-400 hover:text-indigo-500 transition" />
              </button>
            )}
          </motion.div>
        </div>

        {/* Leads Section */}
        {loadingLeads ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
          </div>
        ) : forwardedLeads.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 text-lg font-medium"
          >
            No leads forwarded to you yet.
          </motion.p>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mt-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
            }}
          >
            {filteredLeads.map((lead) => (
              <motion.div
                key={lead._id}
                className="group bg-white/60 backdrop-blur-md shadow-xl rounded-3xl border border-indigo-100 p-7 flex flex-col transition-all duration-300 hover:shadow-2xl hover:border-indigo-300 relative"
                whileHover={{ y: -6, scale: 1.015 }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-indigo-400 tracking-wide">
                    Lead
                  </span>
                  <span className="bg-gradient-to-r from-pink-200 via-indigo-200 to-blue-200 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                    {lead.leadDetails?.clientName || "No Name"}
                  </span>
                </div>
                {/* Phone Numbers */}
                <div className="mb-3 text-base">
                  <span className="font-semibold text-gray-700">📱 </span>
                  {lead.leadDetails?.contacts && lead.leadDetails.contacts.length > 0
                    ? lead.leadDetails.contacts.map((c, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg mr-2 text-xs font-semibold"
                        >
                          {c.number}
                          {c.label && (
                            <span className="ml-1 text-xs text-gray-400 font-normal">
                              ({c.label})
                            </span>
                          )}
                        </span>
                      ))
                    : (
                        <span className="text-gray-500">
                          {lead.leadDetails?.contact || 'N/A'}
                        </span>
                      )}
                </div>
                {/* Meta Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm mb-3">
                  <span className="text-gray-600">
                    <span className="font-semibold text-indigo-600">Created By:</span>{" "}
                    {lead.createdBy?.name}
                  </span>
                  <span className="text-gray-600 mt-1 sm:mt-0">
                    <span className="font-semibold text-indigo-600">Forwarded To:</span>{" "}
                    {lead.forwardedTo?.user?.name || "You"}
                  </span>
                </div>
                {/* Follow-Ups */}
                <div className="mb-3">
                  <button
                    onClick={() => toggleDropdown(lead._id)}
                    className="text-xs px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-400 text-white font-semibold shadow transition-all hover:from-indigo-600 hover:to-blue-500"
                  >
                    {dropdownVisible[lead._id] ? "Hide" : "Show"} Follow-Ups
                  </button>
                  {dropdownVisible[lead._id] && (
                    <motion.div
                      className="mt-2 px-2 py-2 bg-indigo-50 border border-indigo-100 rounded-lg shadow-inner max-h-32 overflow-y-auto text-xs"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {lead.followUps?.length > 0 ? (
                        <ul className="space-y-1">
                          {lead.followUps.map((fup, idx) => (
                            <li key={idx}>
                              <span className="text-blue-600 font-medium">
                                {new Date(fup.date).toLocaleDateString()}
                              </span>: {fup.notes}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">No follow-ups</span>
                      )}
                    </motion.div>
                  )}
                </div>
                {/* View/Update */}
                <div className="mt-auto flex justify-end">
                  <button
                    onClick={() => router.push(`/lead-details/${lead._id}`)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-2xl shadow font-semibold transition text-sm"
                  >
                    View / Update
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  </ProtectedRoute>
);
};
export default ProfilePage;
