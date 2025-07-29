import { groupBy } from "lodash";
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import LeadTable from '../components/LeadTable';
import ProtectedRoute from '../components/ProtectedRoute';
import LeadForm from '../components/LeadForm';
import { FiSearch , FiMenu , FiHome , FiUsers} from 'react-icons/fi';
import BASE_URL from '../utils/api';
import * as XLSX from 'xlsx';
import {useRouter} from 'next/router';
import { toast } from 'react-toastify';
import { BiImport } from "react-icons/bi";
import NotificationBell from "../components/NotificationBell";
import StatCard from '../components/StatCard';
import Link from 'next/link'; 

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
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
        const activeLeads = response.data.filter(lead => lead.lifecycleStatus !== 'dead');
        setMyLeads(activeLeads);
        setFilteredLeads(activeLeads);
 
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

function handleLeadUploaded(countToAdd = 1) {
  const prev = parseInt(localStorage.getItem('totalLeadsUploaded') || '0', 10);
  const newTotal = prev + countToAdd;
  localStorage.setItem('totalLeadsUploaded', newTotal);
  setTotalLeadsUploaded(newTotal);
}

function handlePausedSession() {
  const count = parseInt(localStorage.getItem('pausedSessions') || '0', 10);
  localStorage.setItem('pausedSessions', count + 1);
  setTotalPausedSessions(count + 1);
}

useEffect(() => {
  const count = parseInt(localStorage.getItem('pausedSessions') || '0', 10);
  setTotalPausedSessions(count);
}, []);

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
  key.toLowerCase().replace(/\s+/g, '').replace(/\u00a0/g, '').replace(/\./g, '');

const leads = jsonData.map((row) => {
  const keys = {};
  Object.keys(row).forEach((key) => {
    const normalized = normalizeKey(key);
    keys[normalized] = row[key];
  });

  const contact =
    keys['phonenumber'] ||
    keys['contactnumber'] ||
    keys['contactno'] ||
    keys['phone'] ||
    keys['contact'] ||
    keys['mobile'] ||
    '';

  const companyName =
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

  const clientName =
    keys['clientname'] ||
    keys['name'] ||
    keys['fullname'] ||
    '';

  return {
    leadDetails: {
      clientName: String(clientName || '').trim(),
      contacts: [{ number: String(contact || '').trim() }],
      companyName: String(companyName || '').trim(),
      location: String(location || '').trim(),
      email: String(email || '').trim(),
      source:"Excel",
    },
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
    const res = await axios.post(`${BASE_URL}/api/leads/bulk`, { leads: uploadedLeads }, { headers });
    toast.success(`${res.data.leads.length} leads uploaded successfully ✅`);
    const updated = await axios.get(`${BASE_URL}/api/leads/my-leads`, { headers });
    setMyLeads(updated.data);
    setFilteredLeads(updated.data);

    setUploadedLeads([]);
    handleLeadUploaded(res.data.leads.length); 
  } catch (err) {
    console.error('Upload failed:', err);
    toast.error('Upload failed');
  }
};
const handlePauseResume = async () => {
  const now = new Date();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  if (!isPaused) {
    try {
      await axios.post(`${BASE_URL}/api/pause-logs/save`, {
        pausedAt: now.toISOString()
      }, { headers });

      toast.info('Session Paused');
      setPauseHistory(prev => [...prev, { pausedAt: now.toISOString() }]);
      handlePausedSession();
    } catch (err) {
      toast.error('Pause failed');
      return;
    }
  } else {
    const last = pauseHistory[pauseHistory.length - 1];
    if (last && !last.resumedAt) {
      const pausedDuration = Math.floor((now - new Date(last.pausedAt)) / 1000);
      try {
        await axios.post(`${BASE_URL}/api/pause-logs/save`, {
          resumedAt: now.toISOString(),
          pausedAt: last.pausedAt,
          pausedDuration
        }, { headers });

        toast.success('Session Resumed');
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
};


return (
  <ProtectedRoute>
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 flex flex-col px-4 py-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-lg">
            Leads Portal
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="bg-white px-4 py-2 rounded border text-gray-700 font-medium flex items-center gap-2">
              <span className="bg-indigo-600 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold">
                {loggedInUser?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
              {loggedInUser?.name || 'User'}
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-white border rounded text-gray-700 font-medium"
            >
              Profile
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('loginTime');
                router.push('/login');
              }}
              className="px-4 py-2 bg-red-500 text-white rounded font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <StatCard label="Total Leads" value={myLeads.length} icon={<FiHome />} />
          <StatCard label="Uploaded Today" value={totalLeadsUploaded} icon={<BiImport />} />
          <StatCard label="Paused Sessions" value={totalPausedSessions} icon={<FiUsers />} />
          <div className="bg-white border rounded p-4 flex flex-col items-center">
            <div className="text-sm text-gray-500 mb-1">Login Time</div>
            <div className="text-2xl font-bold text-blue-600">{loginDuration}</div>
            <button
              onClick={handlePauseResume}
              className={`mt-2 px-4 py-1 rounded text-sm font-medium ${
                isPaused ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>

        {/* Search & Upload */}
        <div className="flex flex-wrap gap-3 items-center mb-6">
          <button
            onClick={() => setSearchVisible(prev => !prev)}
            className="px-3 py-2 bg-indigo-600 text-white rounded"
          >
            <FiSearch size={18} />
          </button>
          {searchVisible && (
            <input
              type="text"
              placeholder="Search by phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border rounded text-sm w-60"
            />
          )}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
            className="px-3 py-2 border rounded text-sm"
          />
          <button
            onClick={handleBulkUpload}
            className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
          >
            <BiImport /> Import Leads
          </button>
          <button
            onClick={handleOpenLeadForm}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
          >
            New Lead
          </button>
          <Link href='filter-leads'>
            <button className="px-4 py-2 bg-green-600 text-white rounded text-sm">
              Filter Leads
            </button>
          </Link>
          <Link href="dead-leads">
          <button className="px-4 py-2 bg-gray-600 text-white rounded text-sm">
            View Dead Zone
          </button>
          </Link>
          <Link href="/showReports">
            <button className="px-4 py-2 bg-purple-600 text-white rounded
              text-sm">
              View Reports
            </button>
          </Link>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white border rounded p-4">
            <div className="font-medium text-gray-600 mb-2">Leads by Day</div>
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
          <div className="bg-white border rounded p-4">
            <div className="font-medium text-gray-600 mb-2">Leads by Status</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={Object.entries(
                  myLeads.reduce((acc, cur) => {
                    const status = cur.status || "Unknown";
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([status, count]) => ({ status, count }))}
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

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white border rounded p-4 mb-8">
            <LeadTable
              leads={filteredLeads}
              setLeads={setMyLeads}
              searchTerm={searchTerm}
              loggedInUser={loggedInUser}
              isSearchActive={!!searchTerm.trim()}
            />
          </div>
        )}
        {loading && (
          <div className="text-center text-indigo-600 text-sm">Loading leads...</div>
        )}
        {error && !loading && (
          <div className="text-center text-red-600 text-sm">{error}</div>
        )}

        {/* Lead Form */}
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