import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FilterLeadsPage = () => {
  const [date, setDate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [status, setStatus] = useState('');
  const [followUpDate, setFollowUpDate] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const [followUpDateStrings, setFollowUpDateStrings] = useState([]);
  const [editedDateStrings, setEditedDateStrings] = useState([]);

  useEffect(() => {
    const savedDate = localStorage.getItem('filter_date');
    const savedFollowUp = localStorage.getItem('filter_followUpDate');
    setDate(savedDate ? new Date(savedDate) : null);
    setFollowUpDate(savedFollowUp ? new Date(savedFollowUp) : null);
    setConnectionStatus(localStorage.getItem('filter_connectionStatus') || '');
    setStatus(localStorage.getItem('filter_status') || '');
    const storedLeads = localStorage.getItem('filtered_leads');
    if (storedLeads) setLeads(JSON.parse(storedLeads));
  }, []);

  // Fetch follow-up and edited dates
  useEffect(() => {
    const fetchAllDates = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [followRes, editedRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/leads/followup-dates`, { headers }),
          axios.get(`${BASE_URL}/api/leads/edited-dates`, { headers }),
        ]);
        setFollowUpDateStrings(Array.isArray(followRes.data) ? followRes.data : []);
        setEditedDateStrings(Array.isArray(editedRes.data) ? editedRes.data : []);
      } catch {
        setFollowUpDateStrings([]);
        setEditedDateStrings([]);
      }
    };
    fetchAllDates();
  }, []);

  // Memoize dates as Date objects
  const followUpDateObjs = useMemo(() => followUpDateStrings.map(d => new Date(d)), [followUpDateStrings]);
  const editedDateObjs = useMemo(() => editedDateStrings.map(d => new Date(d)), [editedDateStrings]);

  // Helpers for dot classes
  const getDotClassForFollowUp = (calendarDate) => {
    const today = new Date();
    today.setHours(0,0,0,0);

    // Check if this date is a follow-up date
    const isFollowUp = followUpDateObjs.some(
      d => d.getDate() === calendarDate.getDate() &&
           d.getMonth() === calendarDate.getMonth() &&
           d.getFullYear() === calendarDate.getFullYear()
    );
    if (!isFollowUp) return undefined;

    // Green dot for today or future
    if (calendarDate >= today) return 'has-dot-green';
    // Red dot for past
    return 'has-dot-red';
  };

  const getDotClassForEdited = (calendarDate) => {
    const today = new Date();
    today.setHours(0,0,0,0);

    // Check if this date is an edited date
    const isEdited = editedDateObjs.some(
      d => d.getDate() === calendarDate.getDate() &&
           d.getMonth() === calendarDate.getMonth() &&
           d.getFullYear() === calendarDate.getFullYear()
    );
    if (!isEdited) return undefined;

    // Red dot for past
    if (calendarDate < today) return 'has-dot-red';
    return undefined;
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${BASE_URL}/api/leads/filter`, {
        headers,
        params: {
          date: date ? date.toISOString() : '',
          connectionStatus,
          status,
          followUpDate: followUpDate ? followUpDate.toISOString() : '',
        },
      });
      setLeads(res.data);
      localStorage.setItem('filtered_leads', JSON.stringify(res.data));
      if (res.data.length === 0) toast.info('No leads found for selected filters');
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDate(null);
    setFollowUpDate(null);
    setConnectionStatus('');
    setStatus('');
    setLeads([]);
    localStorage.removeItem('filter_date');
    localStorage.removeItem('filter_connectionStatus');
    localStorage.removeItem('filter_status');
    localStorage.removeItem('filter_followUpDate');
    localStorage.removeItem('filtered_leads');
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">🎯 Filter Leads</h1>
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {/* Edited Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Edited Date</label>
              <DatePicker
                selected={date}
                onChange={selected => {
                  setDate(selected);
                  localStorage.setItem('filter_date', selected?.toISOString() || '');
                }}
                placeholderText="Select date"
                className="w-full border px-3 py-2 rounded"
                dateFormat="dd-MMM-yyyy"
                maxDate={new Date()}
                isClearable
                dayClassName={getDotClassForEdited}
              />
            </div>
            {/* Connection Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Connection Status</label>
              <select
                value={connectionStatus}
                onChange={e => {
                  setConnectionStatus(e.target.value);
                  localStorage.setItem('filter_connectionStatus', e.target.value);
                }}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- All --</option>
                <option value="Connected">Connected</option>
                <option value="Not Connected">Not Connected</option>
              </select>
            </div>
            {/* Lead Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Status</label>
              <select
                value={status}
                onChange={e => {
                  setStatus(e.target.value);
                  localStorage.setItem('filter_status', e.target.value);
                }}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- All --</option>
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
            </div>
            {/* Follow-Up Date (with dot highlights) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
              <DatePicker
                selected={followUpDate}
                onChange={selected => {
                  setFollowUpDate(selected);
                  localStorage.setItem('filter_followUpDate', selected?.toISOString() || '');
                }}
                placeholderText="Select follow-up date"
                className="w-full border px-3 py-2 rounded"
                dateFormat="dd-MMM-yyyy"
                maxDate={new Date()}
                isClearable
                dayClassName={getDotClassForFollowUp}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchLeads}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow font-medium"
            >
              🔍 Filter
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded shadow font-medium"
            >
              🔄 Reset
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center text-gray-600 text-sm">Loading...</div>
        ) : leads.length > 0 ? (
          <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow overflow-auto">
            <h2 className="text-lg font-semibold mb-4">🧾 Filtered Leads: {leads.length}</h2>
            <table className="w-full border text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="border px-3 py-2 text-left">Client Name</th>
                  <th className="border px-3 py-2 text-left">Contact(s)</th>
                  <th className="border px-3 py-2 text-left">Location</th>
                  <th className="border px-3 py-2 text-left">Company</th>
                  <th className="border px-3 py-2 text-left">Connection</th>
                  <th className="border px-3 py-2 text-left">Status</th>
                  <th className="border px-3 py-2 text-left">Follow-Ups</th>
                  <th className="border px-3 py-2 text-left">View Full Lead</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td className="border px-3 py-2">{lead.leadDetails?.clientName || 'N/A'}</td>
                    <td className="border px-3 py-2">
                      {lead.leadDetails?.contacts?.map((c) => c.number).join(', ') || 'N/A'}
                    </td>
                    <td className="border px-3 py-2">{lead.leadDetails?.location || 'N/A'}</td>
                    <td className="border px-3 py-2">{lead.leadDetails?.companyName || 'N/A'}</td>
                    <td className="border px-3 py-2">{lead.connectionStatus || 'N/A'}</td>
                    <td className="border px-3 py-2">{lead.status || 'N/A'}</td>
                    <td className="border px-3 py-2">{lead.followUps?.length || 0}</td>
                    <td className="border px-3 py-2">
                      <Link
                        href={{
                          pathname: '/LeadDetails',
                          query: { leadId: lead._id },
                        }}
                        onClick={() =>
                          localStorage.setItem('selectedLead', JSON.stringify(lead))
                        }
                      >
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          View Lead
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FilterLeadsPage;
