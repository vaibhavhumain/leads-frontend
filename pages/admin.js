import { useEffect, useState } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import BASE_URL from '../utils/api';
import { motion , AnimatePresence} from 'framer-motion';
import { FaUser } from 'react-icons/fa';
import { FaSearch , FaTimes} from 'react-icons/fa';
import { MdAlarm } from 'react-icons/md';
import { useRef } from 'react'
import { MdPauseCircle , MdPlayCircle , MdAccessTime } from 'react-icons/md';

const Admin = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [timerLogs, setTimerLogs] = useState([]);
  const [creatorSearch, setCreatorSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useState(null);
  const [pauseLogs, setPauseLogs] = useState([]);
  const [pauseSearch, setPauseSearch] = useState("");



  useEffect(() => {
  if (searchOpen && inputRef.current) {
    inputRef.current.focus();
  }
}, [searchOpen]);

 useEffect(() => {
  const fetchAdminLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Get current user details
      const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
      setLoggedInUser(userRes.data);

      // Fetch all leads for admin
      const leadsRes = await axios.get(`${BASE_URL}/api/leads/all`, { headers });
      setLeads(leadsRes.data);

      // Fetch all timer logs
      const timerRes = await axios.get(`${BASE_URL}/api/timer-logs/all`, { headers });
      setTimerLogs(timerRes.data);

      // Fetch all pause logs
      const pauseRes = await axios.get(`${BASE_URL}/api/pause-logs/all`, { headers });
      setPauseLogs(pauseRes.data);

    } catch (err) {
      console.error('Error fetching leads/timers/pause logs for admin:', err);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  fetchAdminLeads();
}, []);


  // Format seconds to hh:mm:ss
  function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
  }

  useEffect(() => {
    console.log('Leads:', leads);
    console.log('Timer Logs:', timerLogs);
  }, [leads, timerLogs]);

  const timerDurationByLead = {};
  leads.forEach((lead) => {
    timerDurationByLead[lead._id] = {
      totalDuration: 0,
      creatorName: lead.createdBy?.name || 'N/A',
    };
  });
  timerLogs.forEach((log) => {
    if (!timerDurationByLead[log.leadId]) {
      timerDurationByLead[log.leadId] = {
        totalDuration: 0,
        creatorName: 'N/A',
      };
    }
    timerDurationByLead[log.leadId].totalDuration += log.duration;
  });

  const getCreatorNameByLeadId = (leadId) => {
    const lead = leads.find((l) => l._id === leadId);
    if (lead && lead.createdBy && lead.createdBy.name) {
      return lead.createdBy.name;
    }
    return 'N/A'; // fallback if no match
  };

  const getCreatorNameFromLog = (log) => {
    if (log.creatorName) return log.creatorName;
    return getCreatorNameByLeadId(log.leadId);
  };

  // Filter leads based on creator name (case insensitive)
  const filteredLeads = leads.filter(lead =>
    lead.createdBy?.name?.toLowerCase().includes(creatorSearch.toLowerCase())
  );

  return (
  <ProtectedRoute>
    <Navbar loggedInUser={loggedInUser} />
    <div className="p-8">
      <motion.h1
        className="text-4xl font-extrabold text-blue-600 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Admin Dashboard
      </motion.h1>

      <div className="mb-6 flex items-center gap-2">
        {/* Toggle Button */}
        <button
          className="rounded-full bg-blue-100 hover:bg-blue-200 p-2 transition"
          onClick={() => setSearchOpen(open => !open)}
          aria-label="Toggle search"
          type="button"
        >
          {searchOpen ? (
            <FaTimes className="text-blue-600" size={18} />
          ) : (
            <FaSearch className="text-blue-600" size={18} />
          )}
        </button>

        {/* Animated Search Input */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              key="search"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 192, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 24 }}
              className="relative overflow-hidden"
            >
              <input
                ref={inputRef}
                id="creatorSearch"
                type="text"
                className="border pl-9 pr-3 py-2 rounded w-48 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 text-gray-800 shadow"
                placeholder="Enter creator name..."
                value={creatorSearch}
                onChange={e => setCreatorSearch(e.target.value)}
                style={{ fontWeight: 500, fontSize: "1rem" }}
              />
              <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-blue-300 pointer-events-none" size={16} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lead Details Table */}
      <div className="bg-white rounded-lg shadow-md p-4 overflow-auto">
        <div className="text-2xl font-bold text-blue-700 mb-4 flex items-center gap-2">
          <FaUser />
          <span className='text-red-600'>Lead Details</span>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-indigo-50">
              <th className="p-2 border">Lead Name</th>
              <th className="p-2 border">Created By</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Follow-Ups</th>
              <th className="p-2 border">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead, leadIdx) => (
              <tr key={lead._id} className="even:bg-indigo-50 align-top">
                <td className="p-2 border font-semibold">{lead.leadDetails?.clientName || 'N/A'}</td>
                <td className="p-2 border">{lead.createdBy?.name || 'N/A'}</td>
                <td className="p-2 border">{lead.status || 'N/A'}</td>
                <td className="p-2 border max-w-xs">
                  {lead.followUps && lead.followUps.length > 0 ? (
                    <ul className="list-disc pl-5 max-h-32 overflow-y-auto text-xs text-gray-700">
                      {lead.followUps.map((fup, idx) => (
                        <li key={idx}>
                          <strong>{fup.date ? new Date(fup.date).toLocaleDateString() : 'No Date'}:</strong>{' '}
                          {fup.notes}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-gray-400 italic">No follow-ups</span>
                  )}
                </td>
                <td className="p-2 border text-center">
                  {lead.remarksHistory && lead.remarksHistory.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto bg-blue-50 rounded p-2 text-left shadow-inner">
                      <ul>
                        {lead.remarksHistory.map((remark, rIdx) => (
                          <li key={rIdx} className="mb-2 border-b border-blue-200 pb-1">
                            <div className="font-semibold text-sm text-blue-800">
                              {remark.updatedBy?.name || 'Forwarded User'}
                              <span className="ml-2 text-gray-500 text-xs">
                                {remark.date
                                  ? new Date(remark.date).toLocaleString()
                                  : (remark.createdAt
                                    ? new Date(remark.createdAt).toLocaleString()
                                    : '')}
                              </span>
                            </div>
                            <div className="text-gray-800 text-sm">
                              {remark.remarks}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No remarks</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lead Timer Stop Logs */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-8">
        <div className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
          <MdAlarm />
          <span className='text-red-700'>Lead Timer Stop Logs</span>
        </div>
        {timerLogs.length === 0 ? (
          <p className="text-gray-500">No timer logs yet.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-indigo-50">
                <th className="p-2 border">Lead</th>
                <th className="p-2 border">Stopped By</th>
                <th className="p-2 border">Time Spent</th>
                <th className="p-2 border">Date/Time</th>
              </tr>
            </thead>
            <tbody>
              {timerLogs.map((log, i) => (
                <tr key={i} className="even:bg-indigo-50">
                  <td className="p-2 border font-semibold">{log.leadName}</td>
                  <td className="p-2 border">{log.stoppedByName}</td>
                  <td className="p-2 border">{formatDuration(log.duration)}</td>
                  <td className="p-2 border">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

     {/* User Pause/Resume Session Logs */}
      <div className="bg-white rounded-lg shadow-md p-4 mt-8">
        <div className="text-2xl font-bold mb-4 text-indigo-700 flex items-center gap-2">
          <MdAlarm />
          <span className="text-blue-700">User Pause/Resume Session Logs</span>
        </div>

        {/* Animated Search Input for pause logs */}
        <div className="mb-4 flex items-center gap-2">
          <AnimatePresence>
            <motion.input
              key="pauseSearch"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 230, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              type="text"
              placeholder="🔍 Search by user name..."
              value={pauseSearch}
              onChange={e => setPauseSearch(e.target.value)}
              className="border px-3 py-2 rounded w-60 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition text-gray-700 shadow"
            />
          </AnimatePresence>
        </div>

        <div className="overflow-x-auto">
          {pauseLogs.length === 0 ? (
            <motion.p
              className="text-gray-500"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              No pause/resume logs yet.
            </motion.p>
          ) : (
            <motion.table
              className="w-full border-collapse"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <thead>
                <tr className="bg-indigo-50">
                  <th className="p-2 border text-left">
                    <span className="inline-flex items-center gap-1">
                      <FaUser className="text-indigo-500" /> User
                    </span>
                  </th>
                  <th className="p-2 border text-left">
                    <span className="inline-flex items-center gap-1">
                      <MdPauseCircle className="text-yellow-500" /> Paused At
                    </span>
                  </th>
                  <th className="p-2 border text-left">
                    <span className="inline-flex items-center gap-1">
                      <MdPlayCircle className="text-green-500" /> Resumed At
                    </span>
                  </th>
                  <th className="p-2 border text-left">
                    <span className="inline-flex items-center gap-1">
                      <MdAccessTime className="text-blue-500" /> Paused Duration
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pauseLogs
                  .filter(log => log.pausedAt && log.resumedAt)
                  .filter(log =>
                    log.user?.name?.toLowerCase().includes(pauseSearch.toLowerCase())
                  )
                  .map((log, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ delay: 0.03 * i }}
                      className="even:bg-indigo-50"
                    >
                      <td className="p-2 border font-semibold">
                        <span className="inline-flex items-center gap-2">
                          <FaUser className="text-indigo-400" />
                          {log.user?.name || "N/A"}
                        </span>
                      </td>
                      <td className="p-2 border">
                        <span className="inline-flex items-center gap-2">
                          <MdPauseCircle className="text-yellow-500" />
                          {new Date(log.pausedAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-2 border">
                        <span className="inline-flex items-center gap-2">
                          <MdPlayCircle className="text-green-500" />
                          {new Date(log.resumedAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-2 border">
                        <span className="inline-flex items-center gap-2">
                          <MdAccessTime className="text-blue-500" />
                          {formatDuration(log.pausedDuration)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </motion.table>
          )}
        </div>
      </div>
    </div>
  </ProtectedRoute>
);
};
export default Admin;
