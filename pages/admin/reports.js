import { useEffect, useState } from 'react';
import axios from 'axios';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
import downloadDailyLeadReport from '../../components/Report';
import downloadWeeklyLeadReport from '../../components/downloadWeeklyLeadReport';
import downloadMonthlyLeadReport from '../../components/downloadMonthlyLeadReport';
import PreviousDayReportDownloader from '../../components/PreviousDayReportDownloader';
import BASE_URL from '../../utils/api';
import Link from 'next/link';

const ReportsPage = () => {
  const [users, setUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
      setLoggedInUser(userRes.data);

      const usersRes = await axios.get(`${BASE_URL}/api/users`, { headers });
      setUsers(usersRes.data);
    };

    fetchData();
  }, []);

  if (loggedInUser && loggedInUser.role !== 'admin') {
    return <div className="text-red-500 text-center mt-10 font-bold">🚫 Access Denied: Admins Only</div>;
  }

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
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: first.toISOString().slice(0, 10),
      end: last.toISOString().slice(0, 10),
    };
  };

  const filteredUsers = users.filter(
    (u) =>
      u._id !== loggedInUser?._id &&
      u.name !== 'Admin' &&
      u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <Navbar loggedInUser={loggedInUser} />

      <div className="p-4">
        <Link href="/admin/AdminDashboard">
          <button className='bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2 rounded-xl font-semibold shadow-md transition duration-300'>
            Go to Admin Dashboard
          </button>
        </Link>
      </div>

      <div className="p-6 bg-white min-h-screen">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 text-center">📑 User Reports</h1>

        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="🔍 Search user by name..."
            className="w-full max-w-md border px-4 py-2 rounded-lg shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user._id} className="border rounded-xl p-5 bg-indigo-50 shadow">
              <h2 className="text-lg font-semibold text-indigo-700 mb-3">{user.name}</h2>

              <button onClick={() => downloadDailyLeadReport(today, user._id)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded shadow mb-4 mx-4 mt-4">
                Daily Report
              </button>

              <button
                onClick={() => {
                  const { start, end } = getWeekRange();
                  downloadWeeklyLeadReport(start, end, user._id);
                }}
                className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium px-4 py-2 rounded shadow mx-4"
              >
                Weekly Report
              </button>

              <button
                onClick={() => {
                  const { start, end } = getMonthRange();
                  downloadMonthlyLeadReport(start, end, user._id);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded shadow mx-4"
              >
                Monthly Report
              </button>

              <PreviousDayReportDownloader userId={user._id} userName={user.name} />
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ReportsPage;
