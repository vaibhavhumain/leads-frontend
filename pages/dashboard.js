// import Sidebar from '../components/Sidebar'; 
import { groupBy } from "lodash";
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import LeadTable from '../components/LeadTable';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import LeadForm from '../components/LeadForm';
import { FiSearch , FiMenu , FiHome , FiUsers} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import BASE_URL from '../utils/api';
import * as XLSX from 'xlsx';
import {useRouter} from 'next/router';
import { toast } from 'react-toastify';
import { BiImport } from "react-icons/bi";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

  
const Dashboard = () => {
  const [myLeads, setMyLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVisible, setSearchVisible] = useState(false);
  const [loginDuration, setLoginDuration] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [uploadedLeads, setUploadedLeads] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();
  const [pauseHistory, setPauseHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalPausedSessions, setTotalPausedSessions] = useState(0);
  const [totalLeadsUploaded, setTotalLeadsUploaded] = useState(0);


useEffect(() => {
  if (typeof window !== "undefined") {
    const count = parseInt(localStorage.getItem('totalPausedSessions') || '0', 10);
    setTotalPausedSessions(count);
  }
}, []);

useEffect(() => {
  // Only runs in browser
  const count = parseInt(localStorage.getItem('totalLeadsUploaded') || '0', 10);
  setTotalLeadsUploaded(count);
}, []);


  
  const formRef = useRef(null);

  useEffect(() => {
  setIsClient(true);

  const fetchLeadsAndCheckRole = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
      const user = userRes.data;
      setLoggedInUser(user);

      if (user.role === 'admin') {
        const allLeadsRes = await axios.get(`${BASE_URL}/api/leads/all`, { headers });
        setMyLeads(allLeadsRes.data);
        setFilteredLeads(allLeadsRes.data);

        const logsRes = await axios.get(`${BASE_URL}/api/pause-logs/all`, { headers });
        setPauseHistory(logsRes.data);
      } else {
        const response = await axios.get(`${BASE_URL}/api/leads/my-leads`, { headers });
        setMyLeads(response.data);
        setFilteredLeads(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching leads');
    } finally {
      setLoading(false);
    }
  };

  fetchLeadsAndCheckRole();

  const interval = setInterval(() => {
    const loginTimeString = localStorage.getItem('loginTime');
    if (loginTimeString && !isPaused) {
      const loginTime = new Date(loginTimeString);
      const now = new Date();
      const diff = now - loginTime;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let duration = '';
      if (hours > 0) duration += `${hours}h `;
      if (minutes > 0 || hours > 0) duration += `${minutes}m `;
      duration += `${seconds}s`;

      setLoginDuration(duration.trim());
    }
  }, 1000);

  return () => clearInterval(interval);
}, [isPaused]);


const leadsByDay = Object.entries(
  groupBy(myLeads, (lead) =>
    new Date(lead.createdAt).toLocaleDateString("en-IN")
  )
).map(([date, leads]) => ({
  date,
  count: leads.length,
}));

const leadsByStatus = Object.entries(
  myLeads.reduce((acc, cur) => {
    const status = cur.status || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {})
).map(([status, count]) => ({ status, count }));

// When a new lead is uploaded successfully
function handleLeadUploaded(countToAdd = 1) {
  const prev = parseInt(localStorage.getItem('totalLeadsUploaded') || '0', 10);
  const newTotal = prev + countToAdd;
  localStorage.setItem('totalLeadsUploaded', newTotal);
  setTotalLeadsUploaded(newTotal);
}

// When you pause a session
function handlePausedSession() {
  const count = parseInt(localStorage.getItem('pausedSessions') || '0', 10);
  localStorage.setItem('pausedSessions', count + 1);
  setTotalPausedSessions(count + 1);
}

// On mount
useEffect(() => {
  const count = parseInt(localStorage.getItem('pausedSessions') || '0', 10);
  setTotalPausedSessions(count);
}, []);

    const goToSendImageForm = () => {
    router.push('/SendImageForm');
  };
  useEffect(() => {
  const fetchSearchResults = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    if (!searchTerm.trim()) {
      if (loggedInUser?.role === 'admin') {
        setFilteredLeads(myLeads); 
      } else {
        const ownLeads = myLeads.filter(
          (lead) => lead.createdBy?._id === loggedInUser?._id
        );
        setFilteredLeads(ownLeads);
      }
      return;
    }

    // On search, query global results
    try {
      const response = await axios.get(
        `${BASE_URL}/api/leads/search?phone=${searchTerm}`,
        { headers }
      );
      setFilteredLeads(response.data);
    } catch (err) {
      console.error('Search failed:', err);
      toast.error('Failed to fetch search results');
    }
  };

  if (loggedInUser) {
    fetchSearchResults();
  }
}, [searchTerm, loggedInUser, myLeads]);


  const handleLeadCreated = (newLead) => {
    setMyLeads((prev) => [...prev, newLead]);
    setFilteredLeads((prev) => [...prev, newLead]);
    setIsLeadFormOpen(false);
  };

  const handleOpenLeadForm = () => {
    setIsLeadFormOpen(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleExcelUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    if (!jsonData.length) {
      toast.error("Excel sheet is empty");
      return;
    }

    const normalizeKey = (key) =>
      key.toLowerCase().replace(/\s+/g, '').replace(/\u00a0/g, '');

    const leads = jsonData.map((row) => {
      const keys = {};
      Object.keys(row).forEach((key) => {
        const normalized = normalizeKey(key);
        keys[normalized] = row[key];
      });

      // Flexible mappings
      const phone =
        keys['phonenumber'] ||
        keys['contactnumber'] ||
        keys['contactno'] ||
        keys['phone'] ||
        keys['contact'] ||
        keys['mobile'] ||
        '';

      const company =
        keys['companyname'] ||
        keys['company'] ||
        keys['firmname'] ||
        keys['businessname'] ||
        '';

      const location =
        keys['location'] ||
        keys['place'] ||
        keys['address'] ||
        '';

      const email = keys['email'] || '';

      return {
        leadDetails: {
          clientName: '', // leave blank to edit later
          contact: String(phone).trim(),
          companyName: String(company).trim(),
          location: String(location).trim(),
          email: String(email).trim(),
        }
      };
    });

    setUploadedLeads(leads);
    toast.success(`${leads.length} lead(s) loaded from Excel`);
  };

  reader.readAsArrayBuffer(file);
};


const handleBulkUpload = async () => {
  if (!uploadedLeads.length) {
    toast.error('Please upload an Excel sheet first.');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    // Upload leads to backend
    const res = await axios.post(`${BASE_URL}/api/leads/bulk`, { leads: uploadedLeads }, { headers });
    toast.success(`${res.data.leads.length} leads uploaded successfully ✅`);

    // 🚩 Fetch the updated leads created by the user so that all uploaded leads are shown
    const updated = await axios.get(`${BASE_URL}/api/leads/my-leads`, { headers });
    setMyLeads(updated.data);
    setFilteredLeads(updated.data);

    setUploadedLeads([]);
    handleLeadUploaded(res.data.leads.length); // Optionally update your stat counter
  } catch (err) {
    console.error('Upload failed:', err);
    toast.error('Upload failed');
  }
};


  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-[#f7f8fa] via-[#f9f5fa] to-[#faf8f6] relative">
        {/* Hamburger for mobile */}
        <button
          className="fixed top-4 left-4 z-50 p-2 bg-white shadow md:hidden rounded-lg"
          onClick={() => setSidebarOpen(true)}
        >
          <FiMenu size={26} />
        </button>
        {/* <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /> */}

        {/* Main content */}
<div className="flex-1 flex flex-col min-h-screen px-2 sm:px-4 md:px-8 lg:px-14 py-6 bg-transparent">
          {/* HEADER */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-500 text-white p-4 rounded-2xl flex items-center gap-4 shadow-lg">
              <span className="text-2xl">💼</span>
              <span className="text-lg font-bold">Leads Portal</span>
            </div>
            <div className="flex gap-3 items-center">
              <div className="bg-white px-4 py-2 rounded-2xl shadow flex items-center gap-2 text-gray-700 font-semibold">
  <span className="bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold">
    {/* User's First Initial */}
    {loggedInUser?.name ? loggedInUser.name.charAt(0).toUpperCase() : 'U'}
  </span>
  {/* User's Name */}
  {loggedInUser?.name || 'User'} 
</div>

              <a href="#" className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow text-indigo-600 font-semibold hover:bg-indigo-50">
                <FiHome /> Dashboard
              </a>
              <button
  onClick={() => router.push('/profile')}
  className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow text-gray-700 font-semibold hover:bg-indigo-50"
>
  Profile
</button>

              <button
  onClick={() => {
    // Remove sensitive info
    if (typeof window !== "undefined") {
      localStorage.removeItem('token');
      localStorage.removeItem('loginTime');
      // remove any other user-specific items here
    }
    router.push('/login'); // or your actual login page route
  }}
  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl shadow font-semibold transition"
>
  Logout
</button>

            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 mb-8">
            <div className="bg-white/80 border rounded-2xl shadow-xl p-6 flex flex-col items-center">
              <span className="bg-indigo-50 text-indigo-500 p-2 rounded-full mb-2">
                <FiHome size={24} />
              </span>
              <div className="text-gray-400 text-xs mb-1">Total Leads</div>
              <div className="text-3xl font-bold text-indigo-600">{myLeads.length}</div>
            </div>
            <div className="bg-white/80 border rounded-2xl shadow-xl p-6 flex flex-col items-center">
              <span className="bg-green-50 text-green-500 p-2 rounded-full mb-2">
                <BiImport size={24} />
              </span>
              <div className="text-gray-400 text-xs mb-1">Uploaded Today</div>
              <div className="text-3xl font-bold text-indigo-600">{totalLeadsUploaded}</div>
            </div>
            <div className="bg-white/80 border rounded-2xl shadow-xl p-6 flex flex-col items-center">
              <span className="bg-yellow-50 text-yellow-500 p-2 rounded-full mb-2">
                <FiUsers size={24} />
              </span>
             <div className="text-gray-400 text-xs mb-1">Paused Sessions</div>
<div className="text-xl font-bold text-yellow-500">{totalPausedSessions}</div>

            </div>
            <div className="bg-white/80 border rounded-2xl shadow-xl p-6 flex flex-col items-center">
              <span className="bg-blue-50 text-blue-500 p-2 rounded-full mb-2">
                <FiHome size={24} />
              </span>
              <div className="text-gray-400 text-xs mb-1">Login Time</div>
<div className="bg-white/80 border rounded-2xl shadow-xl p-6 flex flex-col items-center">
  <div className="flex flex-col items-center gap-2">
    <div className="text-3xl font-bold text-blue-600">{loginDuration}</div>
    <button
  onClick={async () => {
  const now = new Date();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  if (!isPaused) {
    // --- PAUSE: Log pause ---
    try {
      await axios.post(`${BASE_URL}/api/pause-logs/save`, {
        pausedAt: now.toISOString()
      }, { headers });

      toast.info('⏸️ Session Paused');
      setPauseHistory(prev => [...prev, { pausedAt: now.toISOString() }]);
    } catch (err) {
      toast.error('Pause failed');
      return;
    }
  } else {
    // --- RESUME: Log resume ---
    const last = pauseHistory[pauseHistory.length - 1];
    if (last && !last.resumedAt) {
      const pausedDuration = Math.floor((now - new Date(last.pausedAt)) / 1000);
      try {
        await axios.post(`${BASE_URL}/api/pause-logs/save`, {
          resumedAt: now.toISOString(),
          pausedAt: last.pausedAt,
          pausedDuration
        }, { headers });

        toast.success('▶️ Session Resumed');
        setPauseHistory(prev => {
          const updated = [...prev];
          const lastLog = updated[updated.length - 1];
          if (lastLog && !lastLog.resumedAt) {
            lastLog.resumedAt = now.toISOString();
            lastLog.pausedDuration = pausedDuration;
          }
          return updated;
        });
      } catch (err) {
        toast.error('Resume failed');
        return;
      }
    }
  }

  setIsPaused(prev => !prev);
}}

  className={`mt-1 px-4 py-1 rounded-full text-xs font-bold shadow transition ${
    isPaused
      ? "bg-yellow-400 hover:bg-yellow-500 text-white"
      : "bg-red-500 hover:bg-red-600 text-white"
  }`}
>
  {isPaused ? "Resume" : "Pause"}
</button>

  </div>
</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-7">
            <button
              onClick={() => setSearchVisible((prev) => !prev)}
              className="p-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 shadow"
            >
              <FiSearch size={20} />
            </button>
            {searchVisible && (
              <input
                type="text"
                placeholder="🔎 Search by phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 min-w-0 px-4 py-2 border border-indigo-200 rounded-lg shadow-sm text-sm bg-white focus:ring focus:ring-indigo-200 transition"
              />
            )}
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelUpload}
              className="border border-indigo-200 px-4 py-2 rounded-lg text-sm bg-white shadow focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            />
            <button
              onClick={handleBulkUpload}
              className="bg-gradient-to-r from-indigo-400 to-pink-400 hover:from-indigo-500 hover:to-pink-500 text-white px-8 py-3 rounded-full text-lg font-bold shadow-md transition flex items-center gap-2"
            >
              <BiImport size={20} />
              Import Leads
            </button>
            <button
              onClick={handleOpenLeadForm}
              className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white px-8 py-3 rounded-full text-lg font-bold shadow-2xl transition flex items-center gap-2"
            >
              ➕ New Lead
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-8">
  {/* Area/Line Chart: Leads by Day */}
  <div className="bg-white/70 border rounded-2xl shadow-xl p-6 min-h-[250px] flex flex-col">
    <div className="font-bold mb-2 text-gray-600">Leads by Day</div>
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={leadsByDay}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>

  {/* Bar Chart: Leads by Status */}
  <div className="bg-white/70 border rounded-2xl shadow-xl p-6 min-h-[250px] flex flex-col">
    <div className="font-bold mb-2 text-gray-600">Leads by Status</div>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={
          Object.entries(
            myLeads.reduce((acc, cur) => {
              const status = cur.status || "Unknown";
              acc[status] = (acc[status] || 0) + 1;
              return acc;
            }, {})
          ).map(([status, count]) => ({ status, count }))
        }
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="status" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="count" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

          {/* Leads Table */}
          {!loading && !error && (
            <div className="bg-white/90 rounded-3xl shadow-xl p-6 mb-8 border">
              <LeadTable
                leads={filteredLeads}
                setLeads={setMyLeads}
                searchTerm={searchTerm}
                loggedInUser={loggedInUser}
                isSearchActive={!!searchTerm.trim()}
              />
            </div>
          )}

        {/* Admin Pause Logs */}
        {loggedInUser?.role === 'admin' && pauseHistory.length > 0 && (
          <div className="mt-6 bg-white border p-4 rounded-lg shadow max-w-xl">
            <h2 className="text-lg font-bold mb-2 text-indigo-600">⏳ User Pause Logs</h2>
            <ul className="text-sm text-gray-700 space-y-2 max-h-[250px] overflow-y-auto">
              {pauseHistory.map((entry, idx) => (
                <li key={idx} className="border-b pb-1">
                  <div>🛑 Paused At: <strong>{new Date(entry.pausedAt).toLocaleString()}</strong></div>
                  {entry.resumedAt && (
                    <>
                      <div>▶️ Resumed At: <strong>{new Date(entry.resumedAt).toLocaleString()}</strong></div>
                      <div>
                        ⏱️ Paused Duration: <strong>
                          {Math.floor(entry.pausedDuration / 3600) > 0 && `${Math.floor(entry.pausedDuration / 3600)}h `}
                          {Math.floor((entry.pausedDuration % 3600) / 60) > 0 && `${Math.floor((entry.pausedDuration % 3600) / 60)}m `}
                          {entry.pausedDuration % 60}s
                        </strong>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center text-indigo-600 font-medium text-sm mt-4">
            🔄 Loading leads...
          </div>
        )}
        {error && !loading && (
          <div className="text-center text-red-600 font-semibold text-sm mt-4">
            ❌ {error}
          </div>
        )}

        {/* Lead Form Modal */}
        {isLeadFormOpen && loggedInUser?.role !== 'admin' && (
          <div ref={formRef} className="mt-10">
            <LeadForm
              closeModal={() => setIsLeadFormOpen(false)}
              onLeadCreated={handleLeadCreated}
            />
          </div>
        )}
      </div>
    </div>
  </ProtectedRoute>
);
}
export default Dashboard