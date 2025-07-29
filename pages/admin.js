import { useEffect, useState } from 'react';
import axios from 'axios';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import BASE_URL from '../utils/api';
import { motion , AnimatePresence} from 'framer-motion';
import { FaUser , FaChevronLeft , FaChevronRight , FaUserTie , FaPhoneAlt , FaBuilding , FaMapMarkerAlt  } from 'react-icons/fa';
import { MdAlarm } from 'react-icons/md';
import { toast } from 'react-toastify';
import downloadDailyLeadReport from '../components/Report'; 
import downloadWeeklyLeadReport from '../components/downloadWeeklyLeadReport';
import downloadMonthlyLeadReport from '../components/downloadMonthlyLeadReport';
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [timerLogs, setTimerLogs] = useState([]);
  const [creatorSearch, setCreatorSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useState(null);
  const [pauseLogs, setPauseLogs] = useState([]);
  const [pauseSearch, setPauseSearch] = useState("");
  const [filteredIdx , setFilteredIdx] = useState(0);
  const [leadIdx , setLeadIdx] = useState(0);
    const filteredLeads = leads.filter(lead =>
    lead.createdBy?.name?.toLowerCase().includes(creatorSearch.toLowerCase())
  );
  const filteredCount =  filteredLeads.length;
  const totalLeads = leads.length;

  const handlePrevFiltered = () => setFilteredIdx(i => (i === 0 ? filteredCount - 1 : i-1));
  const handleNextFiltered = () => setFilteredIdx(i => (i === filteredCount - 1 ? 0 : i+1));

  const handlePrevAll = () => setLeadIdx(i => (i === 0 ? totalLeads - 1 : i - 1));
  const handleNextAll = () => setLeadIdx(i => (i === totalLeads - 1 ? 0 : i + 1));

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

      const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
      setLoggedInUser(userRes.data);

      const allUsersRes = await axios.get(`${BASE_URL}/api/users`, { headers });
      setUsers(allUsersRes.data);

      const leadsRes = await axios.get(`${BASE_URL}/api/leads/all`, { headers });
      setLeads(leadsRes.data);

      const timerRes = await axios.get(`${BASE_URL}/api/timer-logs/all`, { headers });
      setTimerLogs(timerRes.data);

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

const today = new Date().toISOString().slice(0, 10);

const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
};

const getMonthRange = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: firstDay.toISOString().slice(0, 10),
    end: lastDay.toISOString().slice(0, 10),
  };
};


 useEffect(() => {
  const fetchAdminLeads = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
      setLoggedInUser(userRes.data);

      const leadsRes = await axios.get(`${BASE_URL}/api/leads/all`, { headers });
      setLeads(leadsRes.data);

      const timerRes = await axios.get(`${BASE_URL}/api/timer-logs/all`, { headers });
      setTimerLogs(timerRes.data);

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
    return 'N/A'; 
  };

  const getCreatorNameFromLog = (log) => {
    if (log.creatorName) return log.creatorName;
    return getCreatorNameByLeadId(log.leadId);
  };



  return (
  <ProtectedRoute>
    <Navbar loggedInUser={loggedInUser} />
      <div className="p-4 sm:p-8 bg-white min-h-screen">
      <motion.h1
  className="text-3xl sm:text-4xl font-bold text-center text-indigo-700 mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="inline-flex items-center gap-2">
          Admin Dashboard
        </span>
      </motion.h1>

<div className="grid sm:grid-cols-2 gap-8 mb-12">
  {/* Pie Chart for Lead Status */}
<div className="bg-white border rounded shadow p-5">
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
<div className="bg-white border rounded shadow p-5">
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
<div className="bg-white border rounded shadow p-5">
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

 <motion.div className="bg-white border rounded shadow p-6 mb-12"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.25 }}
>
  <div className="flex items-center gap-3 mb-5">
    <FaUser className="text-indigo-500 text-2xl" />
    <span className="text-2xl font-bold text-indigo-700">Lead Details</span>
  </div>
  {filteredCount === 0 ? (
    <div className="italic text-gray-400 py-10">No leads found.</div>
  ) : (
    <>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handlePrevFiltered}
          className="p-3 bg-indigo-100 hover:bg-indigo-200 rounded-full shadow transition"
        >
          <FaChevronLeft size={22} className="text-indigo-600" />
        </button>
        <span className="font-semibold text-indigo-700 text-lg">{filteredIdx + 1} / {filteredCount}</span>
        <button
          onClick={handleNextFiltered}
          className="p-3 bg-indigo-100 hover:bg-indigo-200 rounded-full shadow transition"
        >
          <FaChevronRight size={22} className="text-indigo-600" />
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={filteredLeads[filteredIdx]._id}
          className="w-full max-w-xl bg-white border rounded shadow p-6"
          initial={{ opacity: 0, scale: 0.96, y: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -60 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          {/* Card Content */}
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-2 text-indigo-700 font-bold text-lg">
              <FaUserTie className="text-indigo-500" />
              {filteredLeads[filteredIdx].leadDetails?.clientName || 'N/A'}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-500 font-semibold tracking-wide">
              {filteredLeads[filteredIdx].status || 'N/A'}
            </span>
          </div>
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <FaUser className="text-indigo-400" />
              <span className="font-semibold">Created By:</span>
              <span>{filteredLeads[filteredIdx].createdBy?.name || 'N/A'}</span>
            </div>
             <div className="mt-2">
    <span className="font-bold text-indigo-700">Meetings & Visits:</span>
    {filteredLeads[filteredIdx].activities && filteredLeads[filteredIdx].activities.length > 0 ? (
      <ul className="mt-1 space-y-1">
        {filteredLeads[filteredIdx].activities.map((activity, idx) => (
          <li key={idx} className="flex flex-col bg-indigo-50 rounded px-3 py-2 text-xs">
            <span>
              <span className="font-semibold text-pink-500">
                {activity.type === 'factory_visit' ? 'Factory Visit' : activity.type === 'in_person_meeting' ? 'In-Person Meeting' : 'Activity'}
              </span>
              {" • "}
              {activity.date ? new Date(activity.date).toLocaleDateString() : 'No Date'}
              {" • "}
              <span className="text-gray-500">
                {activity.location || 'No Location'}
              </span>
            </span>
            {activity.remarks && (
              <span className="text-gray-700">
                Remarks: {activity.remarks}
              </span>
            )}
            {activity.outcome && (
              <span className="text-gray-600 italic">
                Outcome: {activity.outcome}
              </span>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <div className="italic text-gray-400 bg-indigo-50 px-3 py-2 rounded text-xs">No meetings or visits</div>
    )}
  </div>
            {/* add more fields as you want */}
          </div>
          {/* Follow-Ups */} 
          <div className="font-bold text-indigo-700 mt-3">Follow-Ups:</div>
          <div>
            {filteredLeads[filteredIdx].followUps && filteredLeads[filteredIdx].followUps.length > 0 ? (
              <ul className="space-y-1">
                {filteredLeads[filteredIdx].followUps.map((fup, i) => (
                  <li key={i} className="bg-indigo-50 text-xs rounded px-3 py-1 flex items-center">
                    <span className="text-indigo-400 font-semibold mr-2">
                      {fup.date ? new Date(fup.date).toLocaleDateString() : ""}
                    </span>
                    <span>{fup.notes}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="italic text-gray-400 bg-indigo-50 px-3 py-1 rounded text-xs">No follow-ups</div>
            )}
          </div>
          {/* Remarks */}
          <div className="font-bold text-pink-500 mt-3">Remarks:</div>
          <div>
            {filteredLeads[filteredIdx].remarksHistory && filteredLeads[filteredIdx].remarksHistory.length > 0 ? (
              <ul className="space-y-1">
                {filteredLeads[filteredIdx].remarksHistory.map((remark, rIdx) => (
                  <li key={rIdx} className="bg-pink-50 text-xs rounded px-3 py-1">
                    <span className="font-semibold text-indigo-600">{remark.updatedBy?.name || 'User'}</span>
                    <span className="text-gray-500 ml-2">{remark.date ? new Date(remark.date).toLocaleString() : ""}</span>
                    <div className="text-gray-700">{remark.remarks}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="italic text-gray-400 bg-pink-50 px-3 py-1 rounded text-xs">No remarks</div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )}
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
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-4 font-semibold">Lead</th>
            <th className="p-4 font-semibold">Stopped By</th>
            <th className="p-4 font-semibold">Time Spent</th>
            <th className="p-4 font-semibold">Date/Time</th>
          </tr>
        </thead>
        <tbody>
          {timerLogs.map((log, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
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

      <button
  onClick={async () => {
    if (!window.confirm("Are you sure you want to delete ALL leads?")) return;
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      await axios.delete(`${BASE_URL}/api/leads/`, { headers });
      setLeads([]); 
      toast.success('All leads deleted!');
    } catch (err) {
      toast.error('Delete failed');
    }
  }}
className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded text-sm font-semibold shadow"
>
  Delete All Leads
</button>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-10 flex flex-col items-center">
        
  <div className="flex items-center gap-3 mb-5">
    <FaUser className="text-indigo-500 text-2xl" />
    <span className="text-2xl font-bold text-indigo-700">All Leads</span>
  </div>
  {totalLeads === 0 ? (
    <div className="italic text-gray-400 py-10">No leads found.</div>
  ) : (
    <>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handlePrevAll}
          className="p-3 bg-indigo-100 hover:bg-indigo-200 rounded-full shadow transition"
        >
          <FaChevronLeft size={22} className="text-indigo-600" />
        </button>
        <span className="font-semibold text-indigo-700 text-lg">{leadIdx + 1} / {totalLeads}</span>
        <button
          onClick={handleNextAll}
          className="p-3 bg-indigo-100 hover:bg-indigo-200 rounded-full shadow transition"
        >
          <FaChevronRight size={22} className="text-indigo-600" />
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={leads[leadIdx]._id}
          className="w-full max-w-xl bg-gradient-to-br from-indigo-50 via-white to-pink-50 rounded-3xl shadow-2xl p-8 border border-indigo-100 flex flex-col gap-5 relative"
          initial={{ opacity: 0, scale: 0.96, y: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -60 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-2 text-indigo-700 font-bold text-lg">
              <FaUserTie className="text-indigo-500" />
              {leads[leadIdx].leadDetails?.clientName || 'N/A'}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-500 font-semibold tracking-wide">
              {leads[leadIdx].status || 'N/A'}
            </span>
          </div>
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <FaUser className="text-indigo-400" />
              <span className="font-semibold">Created By:</span>
              <span>{leads[leadIdx].createdBy?.name || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaPhoneAlt className="text-pink-400" />
              <span className="font-semibold">Phone:</span>
              <span>
                {Array.isArray(leads[leadIdx].leadDetails?.contacts) 
                  ? leads[leadIdx].leadDetails.contacts.map((c, i) => (
                      <span key={i} className="inline-block mr-1">{c.number}</span>
                    ))
                  : (leads[leadIdx].leadDetails?.contact || 'N/A')
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaBuilding className="text-green-400" />
              <span className="font-semibold">Company:</span>
              <span>{leads[leadIdx].leadDetails?.companyName || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-400" />
              <span className="font-semibold">Location:</span>
              <span>{leads[leadIdx].leadDetails?.location || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Email:</span>
              <span>{leads[leadIdx].leadDetails?.email || 'N/A'}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )}
</div>

<div className='bg-white rounded-2xl shadow-lg p-6 mb-10'>
  <h2 className='text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-2'>
    <FaUser className='text-indigo-500'/> Download Reports for Users
  </h2>
  <div className='grid grid-cols-1 md:grid-cols=2 lg:grid-cols-3 gap-6'>
    {users
    .filter(user => user._id !== loggedInUser?._id && user.name !== 'Admin')
    .map(user => (
      <div key={user._id} className='bg-indigo-50 border border-indigo-200 rounded-lg p-4 shadow'>
        <h3 className='text-lg font-semibold text-indigo-800 mb-2'>{user.name}</h3>
        <button onClick={() => downloadDailyLeadReport(today, user._id)} className='bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded shadow mb-4 mx-4 mt-4'>
          Daily Report
        </button>
        <button onClick={() => {const {start,end}=getWeekRange(); downloadWeeklyLeadReport(start,end,user._id);}} className='bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium px-4 py-2 rounded shadow mx-4'>
          Weekly Report
        </button>
        <button onClick={()=> {const {start,end}=getMonthRange(); downloadMonthlyLeadReport(start,end,user._id);}} className='bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded shadow mx-4'>
          Monthly Report
        </button>
      </div>
    ))}
  </div>
</div>
    </div>
  </ProtectedRoute>
);
};
export default Admin;
