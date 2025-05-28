import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import LeadTable from '../components/LeadTable';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import LeadForm from '../components/LeadForm';
import { FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import BASE_URL from '../utils/api';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';


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
      if (loginTimeString) {
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
  }, []);

  useEffect(() => {
  const fetchSearchResults = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    if (!searchTerm.trim()) {
      // Restore only self-created leads
      if (loggedInUser?.role === 'admin') {
        setFilteredLeads(myLeads); // Admin can see all
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

    const res = await axios.post(`${BASE_URL}/api/leads/bulk`, { leads: uploadedLeads }, { headers });
    toast.success(`${res.data.leads.length} leads uploaded successfully ✅`);

    setMyLeads((prev) => [...res.data.leads, ...prev]);
setFilteredLeads((prev) => [...res.data.leads, ...prev]);
    setUploadedLeads([]);
  } catch (err) {
    console.error('Upload failed:', err);
    toast.error('Upload failed');
  }
};

    return (
  <ProtectedRoute>
    <Navbar />
    <div className="w-full px-6 py-10 bg-gradient-to-tr from-[#f0f9ff] via-[#f5e8ff] to-[#ffeef5] min-h-screen font-sans">
      {/* Header */}
      <div className="mb-10 flex flex-wrap justify-between items-center">
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight drop-shadow-sm">
          🎯 Dashboard Overview
        </h1>
        <div className="bg-green-100 text-green-900 px-5 py-1.5 rounded-full shadow text-sm font-semibold">
          ⏱️ Logged in: <span className="font-bold">{loginDuration}</span>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleExcelUpload}
          className="border border-blue-300 px-4 py-2 rounded-lg text-sm bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          onClick={handleBulkUpload}
          className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition"
        >
          📥 Import & Save Leads
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <button
          onClick={() => setSearchVisible((prev) => !prev)}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md"
        >
          <FiSearch size={18} />
        </button>

        {searchVisible && (
          <>
            <input
              type="text"
              placeholder="Search by phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-blue-300 rounded-lg shadow-sm text-sm bg-white focus:ring focus:ring-blue-300 transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-red-500 hover:text-red-700 text-xs font-medium"
              >
                Clear
              </button>
            )}
          </>
        )}
      </div>

      {/* Lead Table */}
      {!loading && !error && (
        <div className="bg-white bg-opacity-80 rounded-3xl shadow-2xl p-6 backdrop-blur-sm border border-blue-100">
          <LeadTable
            leads={filteredLeads}
            setLeads={setMyLeads}
            searchTerm={searchTerm}
            loggedInUser={loggedInUser}
            isSearchActive={!!searchTerm.trim()}
          />
        </div>
      )}

      {/* Loading/Error States */}
      {loading && (
        <div className="text-center text-blue-600 font-medium text-sm mt-4">
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

      {/* Floating Button */}
      {loggedInUser?.role !== 'admin' && (
        <button
          onClick={handleOpenLeadForm}
          className="fixed bottom-6 right-6 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold z-50 transition"
        >
          ➕ New Lead
        </button>
      )}
    </div>
  </ProtectedRoute>
);

};

export default Dashboard;
