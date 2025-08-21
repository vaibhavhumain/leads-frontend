import { groupBy } from "lodash";
import { useEffect, useState } from "react";
import axios from "axios";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import BASE_URL from "../utils/api";
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend,
} from "recharts";
import Link from "next/link";

const Analytics = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [myLeads, setMyLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        const user = userRes.data;
        setLoggedInUser(user);

        if (user?.role === "admin") {
          const allLeadsRes = await axios.get(`${BASE_URL}/api/leads/all`, { headers });
          setMyLeads(allLeadsRes.data);
        } else {
          const res = await axios.get(`${BASE_URL}/api/leads/my-leads`, { headers });
          const activeLeads = res.data.filter((l) => l.lifecycleStatus !== "dead");
          setMyLeads(activeLeads);
        }
      } catch (e) {
        setError(e.response?.data?.message || "Error fetching analytics");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const leadsByDay = Object.entries(
    groupBy(myLeads, (lead) => new Date(lead.createdAt).toLocaleDateString("en-IN"))
  ).map(([date, leads]) => ({ date, count: leads.length }));

  const leadsByStatus = Object.entries(
    myLeads.reduce((acc, cur) => {
      const status = cur.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ status, count }));

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
            <Link href="/" className="text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50">
              ← Back to Dashboard
            </Link>
          </div>

          {loading && <div className="text-indigo-600 text-sm">Loading charts…</div>}
          {error && !loading && <div className="text-rose-600 text-sm">{error}</div>}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-slate-700">Leads by Day</div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={leadsByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
                <div className="font-semibold text-slate-700 mb-2">Leads by Status</div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={leadsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Analytics;
