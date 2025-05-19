import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BASE_URL from '../utils/api'; 
import { HomeIcon } from '@heroicons/react/24/solid';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [forwardedLeads, setForwardedLeads] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const router = useRouter();
  const [dropdownVisible, setDropdownVisible] = useState({});

  const statusOptions = ['Hot', 'Warm', 'Cold'];
  
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/api/users/me`, {

          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200">
      <ToastContainer />

      {/* Background */}
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-purple-300 opacity-30 rounded-full blur-3xl z-0"
        animate={{ y: [0, 50, 0], x: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[-150px] right-[-150px] w-[350px] h-[350px] bg-blue-300 opacity-20 rounded-full blur-3xl z-0"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full px-6 py-10">
        <motion.h1
          className="text-4xl font-bold mb-6 text-center text-indigo-700"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          My Profile
        </motion.h1>

        {/* Dashboard Button with Icon */}
        <motion.button
          onClick={() => router.push('/dashboard')}
          className="mb-6 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <HomeIcon className="w-5 h-5" />
          Go to Dashboard
        </motion.button>

        {loadingUser ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
          </div>
        ) : user ? (
          <motion.div
            className="bg-white shadow-lg rounded p-6 mb-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-lg"><strong>Name:</strong> {user.name}</p>
            <p className="text-lg"><strong>Email:</strong> {user.email}</p>
            
          </motion.div>
        ) : (
          <p>Error loading user info.</p>
        )}

        <motion.h2
          className="text-2xl font-semibold mb-4 text-gray-700"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Leads Forwarded To Me
        </motion.h2>

        {loadingLeads ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
          </div>
        ) : forwardedLeads.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500"
          >
            No leads forwarded to you yet.
          </motion.p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg mt-6 w-full">
            <table className="w-full table-auto text-sm text-left text-gray-700">
  <thead className="bg-indigo-200 text-indigo-800 text-sm">
    <tr>
      <th className="px-4 py-3">Lead Name</th>
      <th className="px-4 py-3">Phone</th>
      <th className="px-4 py-3">Created By</th>
      <th className="px-4 py-3">Forwarded To</th>
      <th className="px-4 py-3">Follow-Ups</th>
      <th className="px-4 py-3">View / Update</th> {/* ✅ Fix: remove colSpan */}
    </tr>
  </thead>
  <tbody>
    {forwardedLeads.map((lead) => (
      <tr key={lead._id} className="border-t hover:bg-gray-50 transition-all">
        <td className="px-4 py-2">{lead.leadDetails?.name}</td>
        <td className="px-4 py-2">{lead.leadDetails?.phone || 'N/A'}</td>
        <td className="px-4 py-2">{lead.createdBy?.name}</td>
        <td className="px-4 py-2">{lead.forwardedTo?.user?.name || 'N/A'}</td>
        <td className="px-4 py-2 text-xs whitespace-pre-line">
          <button
            onClick={() => toggleDropdown(lead._id)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-2 py-1 rounded"
          >
            {dropdownVisible[lead._id] ? 'Hide' : 'Show'} Follow-Ups
          </button>
          {dropdownVisible[lead._id] && (
            <div className="mt-1">
              {lead.followUps?.length > 0 ? (
                <ul className="space-y-1">
                  {lead.followUps.map((fup, index) => (
                    <li key={index}>
                      <span className="text-blue-600 font-medium">
                        {new Date(fup.date).toLocaleDateString()}
                      </span>: {fup.notes}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-400">No follow-ups</span>
              )}
            </div>
          )}
        </td>
         <td colSpan={3} className="px-4 py-2">
          <button
            onClick={() => router.push(`/lead-details/${lead._id}`)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow text-sm"
          >
            View / Update
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

          </div>
        )}
      </div>
    </div>
  );
};
export default ProfilePage;
