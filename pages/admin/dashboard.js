import { useEffect, useState } from "react";
import axios from "axios";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminNavbar from "../../components/AdminNavbar";
import BASE_URL from "../../utils/api";
import ReportsSection from "../../components/ReportSection";
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
} from "recharts";
import Link from "next/link";

const STATUS_COLORS = [
  "#6366F1", // Indigo
  "#F472B6", // Pink
  "#60A5FA", // Light Blue
  "#FBBF24", // Yellow
  "#10B981", // Green
  "#F87171", // Red
];

const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [timerLogs, setTimerLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analysisRange, setAnalysisRange] = useState("daily");
  const [selectedUser, setSelectedUser] = useState("all");

  // new state for date selectors
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedMonth, setSelectedMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
      2,
      "0"
    )}`
  );

  // Helpers for ranges
  const getWeekRange = (baseDate) => {
    const now = new Date(baseDate);
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  };

  const getMonthRange = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
    firstDay.setHours(0, 0, 0, 0);
    const lastDay = new Date(parseInt(year), parseInt(month), 0);
    lastDay.setHours(23, 59, 59, 999);
    return { start: firstDay, end: lastDay };
  };

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        setLoggedInUser(userRes.data);

        const allUsersRes = await axios.get(`${BASE_URL}/api/users`, { headers });
        setUsers(allUsersRes.data);

        const leadsRes = await axios.get(`${BASE_URL}/api/leads/all`, { headers });
        setLeads(leadsRes.data);

        const timerRes = await axios.get(`${BASE_URL}/api/timer-logs/all`, { headers });
        setTimerLogs(timerRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}m ` : ""}${s}s`;
  };

  // --- Filter Helpers ---
  const filterByRange = (date) => {
    if (!date) return true;
    const d = new Date(date);

    if (analysisRange === "daily") {
      return d.toDateString() === new Date(selectedDate).toDateString();
    }
    if (analysisRange === "weekly") {
      const { start, end } = getWeekRange(selectedDate);
      return d >= start && d <= end;
    }
    if (analysisRange === "monthly") {
      const { start, end } = getMonthRange(selectedMonth);
      return d >= start && d <= end;
    }
    return true;
  };

  const filterByUser = (data, type) => {
    if (selectedUser === "all") return data;
    if (type === "lead") {
      return data.filter((lead) => lead.createdBy?._id === selectedUser);
    }
    if (type === "timer") {
      return data.filter((log) => log.stoppedBy === selectedUser);
    }
    return data;
  };

  // Lead Status Distribution
  const getStatusDistribution = () => {
    const map = {};
    filterByUser(leads, "lead").forEach((lead) => {
      const relevantDate = lead.lastEditedAt || lead.createdAt;
      if (!filterByRange(relevantDate)) return;
      const status = lead.status || "Cold";
      map[status] = (map[status] || 0) + 1;
    });
    return Object.entries(map).map(([status, value], i) => ({
      name: status,
      value,
      color: STATUS_COLORS[i % STATUS_COLORS.length],
    }));
  };

  // Time Spent by User
  const getUserDurationDistribution = () => {
    const userMap = {};
    filterByUser(timerLogs, "timer").forEach((log) => {
      if (!filterByRange(log.createdAt)) return;
      const name = log.stoppedByName || log.user?.name || "N/A";
      userMap[name] = (userMap[name] || 0) + log.duration;
    });
    return Object.entries(userMap).map(([name, value], i) => ({
      name,
      value,
      color: STATUS_COLORS[i % STATUS_COLORS.length],
    }));
  };

  // Call Logs Per User
  const getCallLogsData = () => {
    const callCount = {};
    filterByUser(leads, "lead").forEach((lead) => {
      if (!lead.activities) return;
      lead.activities.forEach((act) => {
        if (act.type === "call" && filterByRange(act.date)) {
          const caller = act.createdByName || "Unknown User";
          callCount[caller] = (callCount[caller] || 0) + 1;
        }
      });
    });
    return Object.entries(callCount).map(([name, count]) => ({
      name,
      count,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!loggedInUser || loggedInUser.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen text-red-600 font-bold text-xl">
        🚫 Access Denied: Admins Only
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <AdminNavbar loggedInUser={loggedInUser} />
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-700">Admin Dashboard</h1>
          <Link
            href="/admin/users"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
          >
            👥 View Users
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mb-6">
          <select
            value={analysisRange}
            onChange={(e) => setAnalysisRange(e.target.value)}
            className="border px-3 py-2 rounded shadow focus:ring-2 focus:ring-indigo-300"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          {analysisRange === "daily" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border px-3 py-2 rounded shadow"
            />
          )}

          {analysisRange === "weekly" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border px-3 py-2 rounded shadow"
            />
          )}

          {analysisRange === "monthly" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border px-3 py-2 rounded shadow"
            />
          )}

          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border px-3 py-2 rounded shadow focus:ring-2 focus:ring-indigo-300"
          >
            <option value="all">All Users</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Lead Status */}
          <div className="bg-white border rounded shadow p-5">
            <div className="text-lg font-bold mb-4 text-indigo-600">
              Lead Status Distribution
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={getStatusDistribution()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {getStatusDistribution().map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" wrapperStyle={{fontSize: "14px"}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Time Spent */}
          <div className="bg-white border rounded shadow p-5">
            <div className="text-lg font-bold mb-4 text-pink-500">
              Time Spent by User
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={getUserDurationDistribution()}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${formatDuration(value)}`}
                  labelLine={false}
                >
                  {getUserDurationDistribution().map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatDuration(value)} />
                <Legend verticalAlign="bottom" wrapperStyle={{fontSize: "14px"}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Call Logs */}
          <div className="bg-white border rounded shadow p-5">
            <div className="text-lg font-bold mb-4 text-green-600">
              Call Logs Per User
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={getCallLogsData()}
                margin={{ top: 20, right: 20, left: 5, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10B981">
                  <LabelList dataKey="count" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-10">
        <ReportsSection users={users} loggedInUser={loggedInUser} />
        </div>
      </div>
    </ProtectedRoute>
  );
};
export default AdminDashboard;
