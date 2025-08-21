// pages/index.jsx (Dashboard)
import { groupBy } from "lodash";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import LeadTable from "../components/LeadTable";
import ProtectedRoute from "../components/ProtectedRoute";
import LeadForm from "../components/LeadForm";
import Navbar from "../components/Navbar"
import {
  FiSearch,
  FiUsers,
  FiGrid,
  FiMenu,
  FiBarChart2,
  FiBox,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiUpload,
  FiPlusCircle,
  FiFilter,
  FiArchive,
  FiFileText,
  FiX,
} from "react-icons/fi";
import BASE_URL from "../utils/api";
import * as XLSX from "xlsx";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { BiImport } from "react-icons/bi";
import NotificationBell from "../components/NotificationBell";
import Link from "next/link";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

/* ------------------------------ Modal UI ------------------------------ */
function Modal({ title, onClose, children }) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" onClick={onClose} />
      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <button
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <FiX className="text-slate-600" />
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </>
  );
}

const Dashboard = () => {
  const [myLeads, setMyLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [loginDuration, setLoginDuration] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [uploadedLeads, setUploadedLeads] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseHistory, setPauseHistory] = useState([]);

  const [totalPausedSessions, setTotalPausedSessions] = useState(0);
  const [totalLeadsUploaded, setTotalLeadsUploaded] = useState(0);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();

  /* -------------------------- Local counters -------------------------- */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const s1 = parseInt(localStorage.getItem("totalPausedSessions") || "0", 10);
      setTotalPausedSessions(s1);
      const s2 = parseInt(localStorage.getItem("totalLeadsUploaded") || "0", 10);
      setTotalLeadsUploaded(s2);
    }
  }, []);

  /* ----------------------- Fetch user & leads ------------------------- */
  useEffect(() => {
    const fetchLeadsAndCheckRole = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        const user = userRes.data;
        setLoggedInUser(user);

        if (user?.Role === "admin") {
          router.replace("/admin");
          return;
        }

        if (user?.role === "admin") {
          const allLeadsRes = await axios.get(`${BASE_URL}/api/leads/all`, { headers });
          setMyLeads(allLeadsRes.data);
          setFilteredLeads(allLeadsRes.data);

          const logsRes = await axios.get(`${BASE_URL}/api/pause-logs/all`, { headers });
          setPauseHistory(logsRes.data);
        } else {
          const response = await axios.get(`${BASE_URL}/api/leads/my-leads`, { headers });
          const activeLeads = response.data.filter((l) => l.lifecycleStatus !== "dead");
          setMyLeads(activeLeads);
          setFilteredLeads(activeLeads);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeadsAndCheckRole();

    /* ticking login timer */
    const interval = setInterval(() => {
      const loginTimeString = localStorage.getItem("loginTime");
      if (loginTimeString && !isPaused) {
        const loginTime = new Date(loginTimeString);
        const now = new Date();
        const diff = now.getTime() - loginTime.getTime();

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        parts.push(`${minutes}m`, `${seconds}s`);
        setLoginDuration(parts.join(" "));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, router]);

  /* -------------------------- Derived data --------------------------- */
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

  /* -------------------------- Local helpers -------------------------- */
  function handleLeadUploaded(countToAdd = 1) {
    const prev = parseInt(localStorage.getItem("totalLeadsUploaded") || "0", 10);
    const newTotal = prev + countToAdd;
    localStorage.setItem("totalLeadsUploaded", newTotal.toString());
    setTotalLeadsUploaded(newTotal);
  }

  function handlePausedSession() {
    const count = parseInt(localStorage.getItem("pausedSessions") || "0", 10);
    localStorage.setItem("pausedSessions", (count + 1).toString());
    setTotalPausedSessions(count + 1);
  }

  /* --------------------------- Search hook --------------------------- */
  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (!searchTerm.trim()) {
        // default: admins see all, others see only own leads
        if (loggedInUser?.role === "admin") setFilteredLeads(myLeads);
        else setFilteredLeads(myLeads.filter((l) => l.createdBy?._id === loggedInUser?._id));
        return;
      }
      try {
        const res = await axios.get(`${BASE_URL}/api/leads/search?phone=${searchTerm}`, { headers });
        setFilteredLeads(res.data);
      } catch (err) {
        console.error("Search failed:", err);
        toast.error("Failed to fetch search results");
      }
    };

    if (loggedInUser) run();
  }, [searchTerm, loggedInUser, myLeads]);

  /* -------------------------- Excel handlers ------------------------- */
  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      if (!jsonData.length) {
        toast.error("Excel sheet is empty");
        return;
      }

      const normalizeKey = (key) =>
        key.toLowerCase().replace(/\s+/g, "").replace(/\u00a0/g, "").replace(/\./g, "");

      const leads = jsonData.map((row) => {
        const keys = {};
        Object.keys(row).forEach((key) => (keys[normalizeKey(key)] = row[key]));

        const contact =
          keys["phonenumber"] ||
          keys["contactnumber"] ||
          keys["contactno"] ||
          keys["phone"] ||
          keys["contact"] ||
          keys["mobile"] ||
          "";

        const companyName =
          keys["companyname"] || keys["company"] || keys["firmname"] || keys["businessname"] || "";

        const location = keys["location"] || keys["place"] || keys["address"] || "";

        const email = keys["email"] || "";

        const clientName = keys["clientname"] || keys["name"] || keys["fullname"] || "";

        return {
          leadDetails: {
            clientName: String(clientName || "").trim(),
            contacts: [{ number: String(contact || "").trim() }],
            companyName: String(companyName || "").trim(),
            location: String(location || "").trim(),
            email: String(email || "").trim(),
            source: "Excel",
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
      toast.error("Please upload an Excel sheet first.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${BASE_URL}/api/leads/bulk`, { leads: uploadedLeads }, { headers });
      toast.success(`${res.data.leads.length} leads uploaded successfully ✅`);
      const updated = await axios.get(`${BASE_URL}/api/leads/my-leads`, { headers });
      setMyLeads(updated.data);
      setFilteredLeads(updated.data);

      setUploadedLeads([]);
      handleLeadUploaded(res.data.leads.length);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Upload failed");
    }
  };

  /* ------------------------- Pause / Resume -------------------------- */
  const handlePauseResume = async () => {
    const now = new Date();
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    if (!isPaused) {
      try {
        await axios.post(`${BASE_URL}/api/pause-logs/save`, { pausedAt: now.toISOString() }, { headers });
        toast.info("Session Paused");
        setPauseHistory((prev) => [...prev, { pausedAt: now.toISOString() }]);
        handlePausedSession();
      } catch {
        toast.error("Pause failed");
        return;
      }
    } else {
      const last = pauseHistory[pauseHistory.length - 1];
      if (last && !last.resumedAt) {
        const pausedDuration = Math.floor((now.getTime() - new Date(last.pausedAt).getTime()) / 1000);
        try {
          await axios.post(
            `${BASE_URL}/api/pause-logs/save`,
            { resumedAt: now.toISOString(), pausedAt: last.pausedAt, pausedDuration },
            { headers }
          );
          toast.success("Session Resumed");
          setPauseHistory((prev) => {
            const updated = [...prev];
            const lastLog = updated[updated.length - 1];
            if (lastLog && !lastLog.resumedAt) {
              lastLog.resumedAt = now.toISOString();
              lastLog.pausedDuration = pausedDuration;
            }
            return updated;
          });
        } catch {
          toast.error("Resume failed");
          return;
        }
      }
    }

    setIsPaused((p) => !p);
  };

  /* =================================================================== */

  return (
    <div>
      <Navbar />
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          {/* ---------------------- Sidebar (desktop) ---------------------- */}
          <aside className="hidden lg:flex w-72 flex-col h-screen sticky top-0 left-0 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 shadow-xl">
            <div className="px-6 py-5 flex items-center gap-3 border-b border-white/10">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                GC
              </div>
              <div className="font-semibold tracking-wide">
                BD &nbsp;<span className="text-indigo-400">Sales Portal</span>
              </div>
            </div>

            <nav className="px-3 py-5 space-y-6 overflow-y-auto">
              <div>
                <p className="px-3 text-xs uppercase tracking-wider text-white/50">Menu</p>
                <ul className="mt-2 space-y-1">
                  <li>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10">
                      <FiGrid className="text-indigo-300" />
                      <span className="font-medium">Dashboard</span>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition">
                      <FiBarChart2 />
    <Link
      href="/analytics"
      className="px-3 py-2 rounded-xl text-sm text-white"
    >
      Open Analytics
    </Link>

                    </div>
                  </li>
                  <li>
                    <Link
                      href="/leads"
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition"
                    >
                      <FiUsers />
                      <span>Leads</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <p className="px-3 text-xs uppercase tracking-wider text-white/50">Management</p>
                <ul className="mt-2 space-y-1">
                  <li className="px-3 py-2 rounded-xl hover:bg-white/5 transition flex items-center gap-3">
                    <FiBox /> <span>
                      <Link href="/gallery">
                      Products
                      </Link>
                  </span>
                  </li>
                  <li className="px-3 py-2 rounded-xl hover:bg-white/5 transition flex items-center gap-3">
                    <FiUser /> <span>Customers</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <div className="p-3 mx-2 rounded-xl bg-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                      {loggedInUser?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{loggedInUser?.name || "User"}</div>
                      <div className="text-xs text-white/70">{loggedInUser?.email || ""}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/profile")}
                    className="mt-3 w-full text-sm px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 transition"
                  >
                    Profile
                  </button>
                </div>
              </div>
            </nav>

            <div className="mt-auto px-6 py-5">
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("loginTime");
                  router.push("/login");
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-medium"
              >
                <FiLogOut /> Log out
              </button>
            </div>
          </aside>

          {/* ----------------------- Mobile Sidebar ----------------------- */}
          {sidebarOpen && (
            <>
              <div
                className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <aside className="fixed z-50 top-0 left-0 h-full w-72 bg-slate-900 text-slate-100 lg:hidden shadow-xl">
                <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                      GC
                    </div>
                    <div className="font-semibold tracking-wide">
                      BD <span className="text-indigo-400">Sales</span>
                    </div>
                  </div>
                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FiX />
                  </button>
                </div>
                <nav className="px-3 py-5 space-y-6">
                  <ul className="space-y-1">
                    <li>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/10">
                        <FiGrid className="text-indigo-300" />
                        <span className="font-medium">Dashboard</span>
                      </div>
                    </li>
                    <li>
                      <Link
                        href="/leads"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition"
                      >
                        <FiUsers />
                        <span>Leads</span>
                      </Link>
                    </li>
                  </ul>
                </nav>
              </aside>
            </>
          )}

          {/* --------------------------- Main ---------------------------- */}
          <main className="flex-1">
            {/* Top bar */}
            <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-slate-200"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <FiMenu />
                  </button>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="text-slate-700 font-semibold">Leads Portal</div>
                  </div>
                </div>

                <div className="flex-1 max-w-2xl mx-6 hidden md:flex">
                  <div className="relative w-full">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by phone number…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {/* KPI cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <FiUsers className="text-indigo-600" />
                    </div>
                    <div className="text-slate-500 text-sm">Total Leads</div>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-slate-800">{myLeads.length}</div>
                  <div className="text-xs text-slate-500">All time</div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <BiImport className="text-indigo-600" />
                    </div>
                    <div className="text-slate-500 text-sm">Uploaded Today</div>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-slate-800">{totalLeadsUploaded}</div>
                  <div className="text-xs text-slate-500">Excel imports</div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <FiUsers className="text-emerald-600" />
                    </div>
                    <div className="text-slate-500 text-sm">Paused Sessions</div>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-slate-800">{totalPausedSessions}</div>
                  <div className="text-xs text-slate-500">This device</div>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <FiBarChart2 className="text-yellow-600" />
                    </div>
                    <div className="text-slate-500 text-sm">Login Time</div>
                  </div>
                  <div className="mt-3 text-2xl font-bold text-slate-800">{loginDuration}</div>
                  <button
                    onClick={handlePauseResume}
                    className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                      isPaused ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                    }`}
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </button>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left: actions + charts + table */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Action toolbar */}
                  <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-2 border rounded-xl text-sm bg-slate-50 cursor-pointer flex items-center gap-2">
                        <FiUpload />
                        <span>Upload Excel</span>
                        <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="hidden" />
                      </label>
                      <button
                        onClick={handleBulkUpload}
                        className="px-3 py-2 rounded-xl text-sm bg-indigo-600 text-white inline-flex items-center gap-2"
                      >
                        <BiImport /> Import Leads
                      </button>

                      {/* NEW LEAD -> opens modal */}
                      <button
                        onClick={() => setIsLeadFormOpen(true)}
                        className="px-3 py-2 rounded-xl text-sm bg-blue-600 text-white inline-flex items-center gap-2"
                        aria-haspopup="dialog"
                        aria-expanded={isLeadFormOpen}
                        aria-controls="new-lead-modal"
                      >
                        <FiPlusCircle /> New Lead
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  {!loading && !error && (
                    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
                      <LeadTable
                        leads={filteredLeads}
                        setLeads={setMyLeads}
                        searchTerm={searchTerm}
                        loggedInUser={loggedInUser}
                        isSearchActive={!!searchTerm.trim()}
                      />
                    </div>
                  )}
                  {loading && <div className="text-center text-indigo-600 text-sm">Loading leads...</div>}
                  {error && !loading && <div className="text-center text-rose-600 text-sm">{error}</div>}
                </div>

                {/* Right panel */}
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 shadow-sm p-5 bg-gradient-to-br from-white to-slate-50">
                    <div className="text-slate-500 text-sm">Active Session</div>
                    <div className="mt-2 text-3xl font-extrabold text-slate-800">{loginDuration}</div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Paused</span>
                        <span className={`font-semibold ${isPaused ? "text-amber-600" : "text-emerald-600"}`}>
                          {isPaused ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Paused Sessions</span>
                        <span className="font-semibold text-slate-700">{totalPausedSessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Uploaded Today</span>
                        <span className="font-semibold text-slate-700">{totalLeadsUploaded}</span>
                      </div>
                    </div>
                    <button
                      onClick={handlePauseResume}
                      className={`mt-4 w-full px-4 py-2 rounded-xl font-medium ${
                        isPaused ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
                      }`}
                    >
                      {isPaused ? "Resume Session" : "Pause Session"}
                    </button>
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                    <div className="font-semibold text-slate-700 mb-3">Quick Links</div>
                    <div className="space-y-2">
                      <Link href="filter-leads" className="block">
                        <div className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-sm">
                          Filter Leads
                        </div>
                      </Link>
                      <Link href="dead-leads" className="block">
                        <div className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-sm">
                          Dead Zone
                        </div>
                      </Link>
                      <Link href="/showReports" className="block">
                        <div className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-sm">
                          Reports
                        </div>
                      </Link>
                      <Link href="/my-lead-dates" className="block">
                        <div className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-sm">
                          My Lead Dates
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
                    <div className="font-semibold text-slate-700 mb-2">Status Overview</div>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={leadsByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="mt-2 text-xs text-emerald-600 font-medium">On Track</div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* ------------------------- New Lead Modal ------------------------- */}
        {isLeadFormOpen && (
          <div id="new-lead-modal">
            <Modal title="Create New Lead" onClose={() => setIsLeadFormOpen(false)}>
              {/* Your existing LeadForm works as-is; no changes required */}
              <LeadForm
                closeModal={() => setIsLeadFormOpen(false)}
                onLeadCreated={(newLead) => {
                  setMyLeads((prev) => [...prev, newLead]);
                  setFilteredLeads((prev) => [...prev, newLead]);
                  setIsLeadFormOpen(false);
                }}
              />
            </Modal>
          </div>
        )}
      </div>
    </ProtectedRoute>
    </div>
  );
};

export default Dashboard;
