import { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import LeadTable from '../components/LeadTable';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FiCalendar } from 'react-icons/fi';

const MyLeadDatesPage = () => {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
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

  const handleDateChange = async (date) => {
    const formatted = date.toLocaleDateString('en-CA'); 
    
    setSelectedDate(formatted);
    setLeads([]);
    setLoadingLeads(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${BASE_URL}/api/leads/filter?date=${formatted}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLeads(res.data || []);
    } catch {
      setLeads([]);
    } finally {
      setLoadingLeads(false);
    }
  };
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const d = date.toLocaleDateString('en-CA');
      if (dates.includes(d)) {
        return 'has-dot-red';
      }
    }
    return '';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto mt-12">
          <div className="bg-white shadow-xl rounded-3xl px-8 py-10 flex flex-col items-center relative">
            {/* Title */}
            <div className="flex flex-col items-center mb-8 mt-2">
              <span className="inline-flex items-center justify-center bg-cyan-100 text-cyan-700 rounded-full w-16 h-16 mb-2 shadow">
                <svg width="36" height="36" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-cyan-800 mb-1">
                My Lead Creation / Import Calendar
              </h1>
              <span className="text-gray-500 text-base font-medium">
                Red dots show your lead creation/import dates
              </span>
            </div>

            <div className="mb-6">
              {loadingDates ? (
                <div className="text-cyan-600 text-center text-lg my-6">Loading calendar...</div>
              ) : (
                <Calendar
                  onChange={handleDateChange}
                  tileClassName={tileClassName}
                  value={selectedDate ? new Date(selectedDate) : null}
                  calendarType="gregory"
                  maxDetail="month"
                  prev2Label={null}
                  next2Label={null}
                  className="rounded-2xl border-cyan-300 shadow"
                />
              )}
            </div>

            {/* Selected date and leads */}
            {selectedDate && (
              <div className="w-full mt-3">
                <div className="mb-4 text-lg text-cyan-700 font-bold flex items-center gap-2 justify-center">
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
