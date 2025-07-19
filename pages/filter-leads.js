import { useState , useEffect } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Navbar from '../components/Navbar';
const FilterLeadsPage = () => {
  const [date, setDate] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [status, setStatus] = useState('');
  const [hasFollowUps, setHasFollowUps] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followUpDates, setFollowUpDates] = useState([]);
  const [followUpDate, setFollowUpDate] = useState('');

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(`${BASE_URL}/api/leads/filter`, {
        headers,
        params: {
          date,
          connectionStatus,
          status,
          followUpDate,
        },
      });

      setLeads(res.data);
      if (res.data.length === 0) toast.info('No leads found for selected filters');
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
  const fetchDates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/leads/followup-dates`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('LEAD FOLLOW-UP RESPONSE:', res.data);
      const uniqueDates = [...new Set(res.data)].sort((a, b) => new Date(b) - new Date(a));
      setFollowUpDates(uniqueDates);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch follow-up dates');
    }
  };
  fetchDates();
}, []);

  return (
    <div>
      <Navbar />
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">🎯 Filter Leads</h1>

      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Connection Status</label>
            <select
              value={connectionStatus}
              onChange={(e) => setConnectionStatus(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- All --</option>
              <option value="Connected">Connected</option>
              <option value="Not Connected">Not Connected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- All --</option>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
            <select value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className='w-full border px-3 py-2 rounded'>
              <option value="">--All --</option>
              {followUpDates.map((date, idx) => (
                <option key={idx} value={date}>
                  {new Date(date).toLocaleDateString('en-IN',{
                    day:'2-digit',
                    month:'short',
                    year:'numeric',
                  })}
                </option>
                ))}
            </select>
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
            onClick={() => {
              setDate('');
              setConnectionStatus('');
              setStatus('');
              setHasFollowUps('');
              setFollowUpDate('');
              setLeads([]);
            }}
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
                    {lead.leadDetails?.contacts?.length > 0
                      ? lead.leadDetails.contacts.map((c) => c.number).join(', ')
                      : 'N/A'}
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
                onClick={() => localStorage.setItem('selectedLead', JSON.stringify(lead))}>
                <span className="text-blue-600 hover:underline cursor-pointer">View Lead</span>
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
