import { useEffect, useState } from 'react';
import axios from 'axios';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import BASE_URL from '../../utils/api';
import Link from 'next/link';

const PauseLogsPage = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [pauseLogs, setPauseLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPauseLogs = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
      setLoggedInUser(userRes.data);

      const res = await axios.get(`${BASE_URL}/api/pause-logs/all`, { headers });
      setPauseLogs(res.data);
    };

    fetchPauseLogs();
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

  const filteredLogs = pauseLogs
    .filter((log) => log.pausedAt && log.resumedAt)
    .filter((log) =>
      log.user?.name?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <ProtectedRoute>
      <Navbar loggedInUser={loggedInUser} />

      <div className="p-4">
        <Link href="/admin/AdminDashboard">
          <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-semibold shadow-md transition duration-300">
            Go to Admin Dashboard
          </button>
        </Link>
      </div>

      <div className="p-6 bg-white min-h-screen">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">⏸ Pause / Resume Logs</h1>

        <div className="mb-6 max-w-md">
          <input
            type="text"
            placeholder="🔍 Search by user name..."
            className="border px-4 py-2 w-full rounded shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table className="w-full border rounded-xl bg-white shadow">
          <thead className="bg-indigo-100 text-indigo-700">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Paused At</th>
              <th className="p-3 text-left">Resumed At</th>
              <th className="p-3 text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-3">{log.user?.name || 'N/A'}</td>
                  <td className="p-3">{new Date(log.pausedAt).toLocaleString()}</td>
                  <td className="p-3">{new Date(log.resumedAt).toLocaleString()}</td>
                  <td className="p-3">{formatDuration(log.pausedDuration)}</td>
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
    </ProtectedRoute>
  );
};

export default PauseLogsPage;
