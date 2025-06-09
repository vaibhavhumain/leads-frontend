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
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from 'recharts';

const STATUS_COLORS = [
  "#6366F1", 
  "#F472B6", 
  "#60A5FA", 
  "#FBBF24", 
  "#10B981", 
  "#F87171", 
];
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

const getStatusDistribution = (leads) => {
  const map = {};
  leads.forEach((lead) => {
    map[lead.status] = (map[lead.status] || 0) + 1;
  });
  return Object.entries(map).map(([status, value], i) => ({
    name: status || "N/A",
    value,
    color: STATUS_COLORS[i % STATUS_COLORS.length],
  }));
};

const getUserDurationDistribution = (timerLogs) => {
  const userMap = {};
  timerLogs.forEach((log) => {
    const name = log.stoppedByName || "N/A";
    userMap[name] = (userMap[name] || 0) + log.duration;
  });
  return Object.entries(userMap).map(([name, value], i) => ({
    name,
    value,
    color: STATUS_COLORS[i % STATUS_COLORS.length],
  }));
};


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

  const getPauseLogsPerUser = (pauseLogs) => {
  const userMap = {};
  pauseLogs.forEach((log) => {
    const name = log.user?.name || "N/A";
    userMap[name] = (userMap[name] || 0) + 1;
  });
  return Object.entries(userMap).map(([name, value]) => ({
    name,
    count: value,
  }));
};


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
    <div className="p-4 sm:p-8 bg-gradient-to-br from-indigo-50 via-white to-blue-50 min-h-screen">
      <motion.h1
        className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-500 to-blue-600 text-center drop-shadow-lg mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="inline-flex items-center gap-2">
          <FaUser className="text-pink-500 drop-shadow" size={38} />
          Admin Dashboard
        </span>
      </motion.h1>

      {/* --- PIE & DONUT CHART SECTION --- */}
<div className="grid sm:grid-cols-2 gap-8 mb-12">
  {/* Pie Chart for Lead Status */}
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="text-lg font-bold mb-4 text-indigo-600">Lead Status Distribution</div>
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={getStatusDistribution(leads)}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {getStatusDistribution(leads).map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" />
      </PieChart>
    </ResponsiveContainer>
  </div>

  {/* Donut Chart for Timer Log Distribution */}
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="text-lg font-bold mb-4 text-pink-500">Time Spent by User</div>
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={getUserDurationDistribution(timerLogs)}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          label
        >
          {getUserDurationDistribution(timerLogs).map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatDuration(value)}
        />
        <Legend verticalAlign="bottom" />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>


  {/* Bar Chart for User Pause Logs */}
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="text-lg font-bold mb-4 text-blue-500">Paused Sessions Per User</div>
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={getPauseLogsPerUser(pauseLogs)}
        margin={{ top: 20, right: 20, left: 5, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#6366F1">
          <LabelList dataKey="count" position="top" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>

      {/* LEAD DETAILS TABLE */}
      <motion.div
        className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-6 mb-12 border border-indigo-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
  <div className="flex items-center gap-3 mb-5">
    <FaUser className="text-indigo-500 text-2xl" />
    <span className="text-2xl font-bold text-indigo-700">Lead Details</span>
  </div>
  <div className="overflow-x-auto">
    <table className="min-w-full text-left rounded-2xl">
      <thead>
        <tr className="bg-indigo-100 text-indigo-700">
          <th className="p-4 font-semibold">Lead Name</th>
          <th className="p-4 font-semibold">Created By</th>
          <th className="p-4 font-semibold">Status</th>
          <th className="p-4 font-semibold">Follow-Ups</th>
          <th className="p-4 font-semibold">Remarks</th>
        </tr>
      </thead>
      <tbody>
        {filteredLeads.map((lead, leadIdx) => (
          <tr key={lead._id} className={leadIdx % 2 === 0 ? "bg-white" : "bg-indigo-50"}>
            <td className="p-4 font-bold">{lead.leadDetails?.clientName || 'N/A'}</td>
            <td className="p-4">{lead.createdBy?.name || 'N/A'}</td>
            <td className="p-4">{lead.status || 'N/A'}</td>
            <td className="p-4 align-top">
              {lead.followUps && lead.followUps.length > 0 ? (
                <div className="bg-indigo-50 rounded-xl px-3 py-2">
                  <ul className="space-y-1 text-sm">
                    {lead.followUps.map((fup, idx) => (
                      <li key={idx}>
                        <span className="text-indigo-500 font-semibold">
                          {fup.date ? `• ${new Date(fup.date).toLocaleDateString()}:` : ""}
                        </span>
                        <span className="ml-2">{fup.notes}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-gray-50 italic text-gray-400 rounded-xl px-3 py-2 text-center">No follow-ups</div>
              )}
            </td>
            <td className="p-4 align-top">
              {lead.remarksHistory && lead.remarksHistory.length > 0 ? (
                <div className="bg-blue-50 rounded-xl px-3 py-2">
                  <ul className="space-y-2 text-sm">
                    {lead.remarksHistory.map((remark, rIdx) => (
                      <li key={rIdx}>
                        <div className="font-semibold text-indigo-600">
                          {remark.updatedBy?.name || 'Forwarded User'}{" "}
                          <span className="text-gray-500 font-normal text-xs">
                            {remark.date
                              ? new Date(remark.date).toLocaleString()
                              : (remark.createdAt
                                  ? new Date(remark.createdAt).toLocaleString()
                                  : "")}
                          </span>
                        </div>
                        <div className="text-gray-700">{remark.remarks}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-gray-50 italic text-gray-400 rounded-xl px-3 py-2 text-center">No remarks</div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div> 
      </motion.div>

      {/* LEAD TIMER STOP LOGS */}
      <motion.div
        className="bg-white/70 backdrop-blur-md rounded-3xl shadow-2xl p-6 mb-12 border border-blue-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-10 mb-10">
  <div className="flex items-center gap-3 mb-5">
    <MdAlarm className="text-pink-500 text-2xl" />
    <span className="text-2xl font-bold text-pink-500">Lead Timer Stop Logs</span>
  </div>
  <div className="overflow-x-auto">
    {timerLogs.length === 0 ? (
      <div className="italic text-gray-400 text-center py-8">No timer logs yet.</div>
    ) : (
      <table className="min-w-full text-left rounded-2xl">
        <thead>
          <tr className="bg-pink-100 text-pink-700">
            <th className="p-4 font-semibold">Lead</th>
            <th className="p-4 font-semibold">Stopped By</th>
            <th className="p-4 font-semibold">Time Spent</th>
            <th className="p-4 font-semibold">Date/Time</th>
          </tr>
        </thead>
        <tbody>
          {timerLogs.map((log, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-pink-50"}>
              <td className="p-4">
                <div className="bg-pink-50 rounded-xl px-3 py-2 font-semibold">{log.leadName}</div>
              </td>
              <td className="p-4">
                <div className="bg-pink-50 rounded-xl px-3 py-2">{log.stoppedByName}</div>
              </td>
              <td className="p-4">
                <div className="bg-pink-50 rounded-xl px-3 py-2">{formatDuration(log.duration)}</div>
              </td>
              <td className="p-4">
                <div className="bg-pink-50 rounded-xl px-3 py-2">{new Date(log.createdAt).toLocaleString()}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
</div>

      </motion.div>

      {/* USER PAUSE/RESUME SESSION LOGS */}
      <motion.div
        className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 mb-12 border border-blue-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.33 }}
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-10 mb-10">
  <div className="flex items-center gap-3 mb-5">
    <MdAlarm className="text-indigo-500 text-2xl" />
    <span className="text-2xl font-bold text-indigo-700">User Pause/Resume Session Logs</span>
  </div>
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
      <div className="italic text-gray-400 text-center py-8">No pause/resume logs yet.</div>
    ) : (
      <table className="min-w-full text-left rounded-2xl">
        <thead>
          <tr className="bg-indigo-100 text-indigo-700">
            <th className="p-4 font-semibold">User</th>
            <th className="p-4 font-semibold">Paused At</th>
            <th className="p-4 font-semibold">Resumed At</th>
            <th className="p-4 font-semibold">Paused Duration</th>
          </tr>
        </thead>
        <tbody>
          {pauseLogs
            .filter(log => log.pausedAt && log.resumedAt)
            .filter(log =>
              log.user?.name?.toLowerCase().includes(pauseSearch.toLowerCase())
            )
            .map((log, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-indigo-50"}>
                <td className="p-4">
                  <div className="bg-indigo-50 rounded-xl px-3 py-2 font-semibold flex items-center gap-2">
                    <FaUser className="text-indigo-400" /> {log.user?.name || "N/A"}
                  </div>
                </td>
                <td className="p-4">
                  <div className="bg-indigo-50 rounded-xl px-3 py-2 flex items-center gap-2">
                    <MdPauseCircle className="text-yellow-500" />
                    {new Date(log.pausedAt).toLocaleString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="bg-indigo-50 rounded-xl px-3 py-2 flex items-center gap-2">
                    <MdPlayCircle className="text-green-500" />
                    {new Date(log.resumedAt).toLocaleString()}
                  </div>
                </td>
                <td className="p-4">
                  <div className="bg-indigo-50 rounded-xl px-3 py-2 flex items-center gap-2">
                    <MdAccessTime className="text-blue-500" />
                    {formatDuration(log.pausedDuration)}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    )}
  </div>
</div>
      </motion.div>
    </div>
  </ProtectedRoute>
);
};
export default Admin;
