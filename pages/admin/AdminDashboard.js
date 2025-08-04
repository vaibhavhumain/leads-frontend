// pages/admin/index.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import BASE_URL from '../../utils/api';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  LabelList,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

const STATUS_COLORS = ["#6366F1", "#F472B6", "#60A5FA", "#FBBF24", "#10B981", "#F87171"];

const AdminDashboard = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [timerLogs, setTimerLogs] = useState([]);
  const [pauseLogs, setPauseLogs] = useState([]);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        setLoggedInUser(userRes.data);

        if (userRes.data.role === 'admin') {
          const [leadsRes, timerRes, pauseRes] = await Promise.all([
            axios.get(`${BASE_URL}/api/leads/all`, { headers }),
            axios.get(`${BASE_URL}/api/timer-logs/all`, { headers }),
            axios.get(`${BASE_URL}/api/pause-logs/all`, { headers }),
          ]);
          setLeads(leadsRes.data);
          setTimerLogs(timerRes.data);
          setPauseLogs(pauseRes.data);
        }
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-indigo-600 text-lg font-semibold">
        Loading admin dashboard...
      </div>
    );
  }

  if (!loggedInUser || loggedInUser.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen text-red-600 text-xl font-bold">
        🚫 Access Denied: Admins Only
      </div>
    );
  }

  const getStatusDistribution = () => {
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

  const getTimeSpentByUser = () => {
    const map = {};
    timerLogs.forEach((log) => {
      const user = log.stoppedByName || "Unknown";
      map[user] = (map[user] || 0) + log.duration;
    });
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: STATUS_COLORS[i % STATUS_COLORS.length],
    }));
  };

  const getPauseCountByUser = () => {
    const map = {};
    pauseLogs.forEach((log) => {
      const user = log.user?.name || "Unknown";
      map[user] = (map[user] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
  };

  return (
    <ProtectedRoute>
      <Navbar loggedInUser={loggedInUser} />
      <div className="p-6 bg-white min-h-screen">
        <h1 className="text-3xl font-bold text-indigo-700 mb-10 text-center">📊 Admin Dashboard</h1>
        <div className='mb-10 flex flex-wrap justify-center gap-4'>
          <button onClick={() => window.location.href='/admin/leads'} className='bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded shadow'>
            📋 View Leads
          </button>
          <button onClick={() => window.location.href='/admin/reports'} className='bg-purple-500 hover:bg-purple-600 text-white font-medium px-4 py-2 rounded shadow'>
          📑 Reports
          </button>
          <button onClick={() => window.location.href='/admin/pause-logs'} className='bg-pink-500 hover:bg-pink-600 text-white font-medium px-4 py-2 rounded shadow'>
            ⏸ Pause Logs
          </button>
          <button onClick={() => window.location.href='/admin/timer-logs'} className='bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded shadow'>
             ⏱ Timer Logs
          </button>
          {/* <button onClick={() => window.location.href=`/admin/lead${lead._id}`} className='bg-amber-500 hover:bg-amber-700  text-white font-medium px-4 py-2 rounded shadow'> show lead details </button>*/}
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          {/* Pie Chart for Status */}
          <div className="bg-white rounded-xl border shadow p-5">
            <h2 className="text-lg font-bold mb-4 text-indigo-700">Lead Status Distribution</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={getStatusDistribution()}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                  label
                >
                  {getStatusDistribution().map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart for Time Spent */}
          <div className="bg-white rounded-xl border shadow p-5">
            <h2 className="text-lg font-bold mb-4 text-pink-500">Time Spent by Users</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={getTimeSpentByUser()}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  label
                >
                  {getTimeSpentByUser().map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatDuration(value)} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart for Pause Count */}
        <div className="mt-12 bg-white rounded-xl border shadow p-5">
          <h2 className="text-lg font-bold mb-4 text-blue-500">Pause Sessions per User</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getPauseCountByUser()} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366F1">
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
