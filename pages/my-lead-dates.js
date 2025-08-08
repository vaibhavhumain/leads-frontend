import { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import LeadTable from '../components/LeadTable';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import { FiChevronDown, FiCalendar, FiArrowLeft } from "react-icons/fi";
import Navbar from '../components/Navbar';

const MyLeadDatesPage = () => {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [leads, setLeads] = useState([]);
  const [loadingDates, setLoadingDates] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchDates = async () => {
      setLoadingDates(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${BASE_URL}/api/leads/my-lead-creation-dates`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDates(res.data || []);
      } catch (err) {
        setDates([]);
      } finally {
        setLoadingDates(false);
      }
    };
    fetchDates();
  }, []);

  const fetchLeadsByDate = async (date) => {
    setSelectedDate(date);
    setLeads([]);
    setLoadingLeads(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${BASE_URL}/api/leads/filter?date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeads(res.data || []);
    } catch {
      setLeads([]);
    } finally {
      setLoadingLeads(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto mt-12">
          <div className="bg-white shadow-xl rounded-3xl px-8 py-10 flex flex-col items-center relative">
            {/* Icon and Title */}
            <div className="flex flex-col items-center mb-8 mt-2">
              <span className="inline-flex items-center justify-center bg-cyan-100 text-cyan-700 rounded-full w-16 h-16 mb-2 shadow">
                <FiCalendar size={36} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-cyan-800 mb-1">
                My Lead Creation / Import Dates
              </h1>
              <span className="text-gray-500 text-base font-medium">
                See when you added or imported leads
              </span>
            </div>
            {/* Date Dropdown */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-5 mt-3 mb-8">
              <label htmlFor="date-dropdown" className="font-semibold text-gray-700">
                Select Date
              </label>
              <div className="relative w-full sm:w-72">
                <select
                  id="date-dropdown"
                  className="w-full appearance-none px-5 py-3 pr-10 border-2 border-cyan-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-cyan-50 text-cyan-900 text-lg font-bold shadow-md transition-all"
                  value={selectedDate}
                  onChange={e => fetchLeadsByDate(e.target.value)}
                  disabled={loadingDates || dates.length === 0}
                  style={{ minHeight: "3.5rem" }}
                >
                  <option value="">-- Choose a date --</option>
                  {dates.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-600 pointer-events-none" size={26} />
              </div>
            </div>
            {/* States */}
            {loadingDates && (
              <div className="text-cyan-600 text-center text-lg my-6">Loading dates...</div>
            )}
            {!loadingDates && dates.length === 0 && (
              <div className="text-center text-gray-400 text-lg my-6">
                No leads created or imported yet.
              </div>
            )}
            {/* Results */}
            {selectedDate && (
              <div className="w-full mt-3">
                <div className="mb-4 text-lg text-cyan-700 font-bold flex items-center gap-2">
                  <FiCalendar /> {selectedDate}
                  {loadingLeads && (
                    <span className="animate-pulse ml-3 text-cyan-500 font-normal text-base">Loading leads...</span>
                  )}
                </div>
                {!loadingLeads && leads.length === 0 && (
                  <div className="text-center text-gray-400 mb-8">No leads found for this date.</div>
                )}
                {!loadingLeads && leads.length > 0 && (
                  <LeadTable leads={leads} searchTerm="" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MyLeadDatesPage;
