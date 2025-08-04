import { useEffect, useState } from 'react';
import axios from 'axios';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import BASE_URL from '../../utils/api';
import Link from 'next/link';

const TimerLogsPage = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
      setLoggedInUser(userRes.data);

      const res = await axios.get(`${BASE_URL}/api/timer-logs/all`, { headers });
      setLogs(res.data);
    };

    fetchLogs();
  }, []);

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
  };

  if (loggedInUser && loggedInUser.role !== 'admin') {
    return <div className="text-red-500 text-center mt-10 font-bold">🚫 Access Denied</div>;
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.leadName?.toLowerCase().includes(search.toLowerCase()) ||
      log.stoppedByName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <Navbar loggedInUser={loggedInUser} />

      <div className="p-4">
        <Link href="/admin">
          <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-semibold shadow-md transition duration-300">
            Go to Admin Dashboard
          </button>
        </Link>
      </div>

      <div className="p-6 bg-white min-h-screen">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">⏱ Timer Logs</h1>

        <div className="mb-6 max-w-xl">
          <input
            type="text"
            placeholder="🔍 Search by lead or user name..."
            className="border px-4 py-2 w-full rounded shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border shadow rounded-xl bg-white">
            <thead className="bg-indigo-100 text-indigo-700">
              <tr>
                <th className="p-3 text-left">Lead</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Duration</th>
                <th className="p-3 text-left">Stopped At</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">{log.leadName}</td>
                    <td className="p-3">{log.stoppedByName}</td>
                    <td className="p-3">{formatDuration(log.duration)}</td>
                    <td className="p-3">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-gray-400 p-4 italic">
                    No matching logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default TimerLogsPage;
