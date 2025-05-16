
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BASE_URL from '../utils/api'; 

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [forwardedLeads, setForwardedLeads] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const router = useRouter();

  const statusOptions = [
    'New',
    'In Progress',
    'Followed Up',
    'Converted',
    'Not Interested',
  ];

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
        setForwardedLeads(response.data);
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



  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200">
      <ToastContainer />

      {/* Background Circles */}
      <motion.div
        className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-purple-300 opacity-30 rounded-full filter blur-3xl animate-pulse z-0"
        animate={{ y: [0, 50, 0], x: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-[-150px] right-[-150px] w-[350px] h-[350px] bg-blue-300 opacity-20 rounded-full filter blur-3xl animate-ping z-0"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-6">
        <motion.h1
          className="text-4xl font-bold mb-6 text-center text-indigo-700"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          My Profile
        </motion.h1>

        <motion.button
          onClick={() => router.push('/dashboard')}
          className="mb-4 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
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
          <div className="overflow-x-auto bg-white rounded-lg shadow">
  <table className="min-w-full text-sm text-left text-gray-700">
    <thead className="bg-indigo-200 text-indigo-800">
      <tr>
        <th className="px-4 py-3">Lead Name</th>
        <th className="px-4 py-3">Created By</th>
        <th className="px-4 py-3">Status</th>
        <th className="px-4 py-3">Remarks</th>
        <th className="px-4 py-3">Date</th>
        <th className="px-4 py-3">Action</th>
      </tr>
    </thead>
    <tbody>
      {forwardedLeads.map((lead) => (
        <tr key={lead._id} className="border-t">
          <td className="px-4 py-2">{lead.leadDetails?.name}</td>
          <td className="px-4 py-2">{lead.createdBy?.name}</td>
          <td className="px-4 py-2">
            <select
              value={statusUpdates[lead._id]?.status || ''}
              onChange={(e) =>
                setStatusUpdates({
                  ...statusUpdates,
                  [lead._id]: {
                    ...statusUpdates[lead._id],
                    status: e.target.value,
                  },
                })
              }
              className="p-1 border rounded"
            >
              <option value="" disabled>
                Select
              </option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </td>
          <td className="px-4 py-2">
            <textarea
              rows={1}
              value={statusUpdates[lead._id]?.remarks || ''}
              onChange={(e) =>
                setStatusUpdates({
                  ...statusUpdates,
                  [lead._id]: {
                    ...statusUpdates[lead._id],
                    remarks: e.target.value,
                  },
                })
              }
              className="w-full p-1 border rounded"
            />
          </td>
          <td className="px-4 py-2">
            <input
              type="date"
              value={statusUpdates[lead._id]?.date || ''}
              onChange={(e) =>
                setStatusUpdates({
                  ...statusUpdates,
                  [lead._id]: {
                    ...statusUpdates[lead._id],
                    date: e.target.value,
                  },
                })
              }
              className="p-1 border rounded"
            />
          </td>
          <td className="px-4 py-2">
            <button
              onClick={(e) => handleStatusUpdate(e, lead._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
            >
              Update
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
