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

  // ---- NEW: For timer logs ----
  const [timerLogs, setTimerLogs] = useState([]);

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

        // ---- Fetch all timer logs ----
        const timerRes = await axios.get(`${BASE_URL}/api/timer-logs/all`, { headers });
        setTimerLogs(timerRes.data);
      } catch (err) {
        console.error('Error fetching leads/timers for admin:', err);
        setError('Failed to load leads');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminLeads();
  }, []);

  // ---- Format seconds to hh:mm:ss
  function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
  }

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
          <>
            <div className="bg-white rounded-lg shadow-md p-4 overflow-auto">
              <LeadTable
                leads={leads}
                setLeads={setLeads}
                searchTerm={searchTerm}
                loggedInUser={loggedInUser}
                isAdminTable={true}
              />
            </div>

            {/* ---- TIMER LOGS SECTION ---- */}
            <div className="bg-white rounded-lg shadow-md p-4 mt-8">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">⏰ Lead Timer Stop Logs</h2>
              {timerLogs.length === 0 ? (
                <p className="text-gray-500">No timer logs yet.</p>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-indigo-50">
                      <th className="p-2 border">Lead</th>
                      <th className="p-2 border">Created By</th>
                      <th className="p-2 border">Stopped By</th>
                      <th className="p-2 border">Time Spent</th>
                      <th className="p-2 border">Date/Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timerLogs.map((log, i) => (
                      <tr key={i} className="even:bg-indigo-50">
                        <td className="p-2 border font-semibold">{log.leadName}</td>
                        <td className="p-2 border">{log.creatorName}</td>
                        <td className="p-2 border">{log.stoppedByName}</td>
                        <td className="p-2 border">{formatDuration(log.duration)}</td>
                        <td className="p-2 border">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
