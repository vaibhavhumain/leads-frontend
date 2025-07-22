import { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

const DeadLeadsPage = () => {
  const [deadLeads, setDeadLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deadDates, setDeadDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchDeadLeads = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/leads/dead-leads?status=dead`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeadLeads(res.data.leads);

        // Gather all unique dead dates from leads
        const dates = Array.from(new Set(res.data.leads
          .map(l => l.deadDate && new Date(l.deadDate).toISOString().slice(0,10))
          .filter(Boolean)
        ));
        setDeadDates(dates.sort((a, b) => new Date(b) - new Date(a))); // Newest first
      } catch (err) {
        console.error("Failed to fetch dead leads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeadLeads();
  }, []);

  const handleViewLead = (lead) => {
    localStorage.setItem('selectedLead', JSON.stringify(lead));
    router.push({
      pathname: '/LeadDetails',
      query: { leadId: lead._id, isDead: 'true' },
    });
  };

  // Filter by selected date if selected
  const filteredLeads = selectedDate
    ? deadLeads.filter(l => l.deadDate && new Date(l.deadDate).toISOString().slice(0,10) === selectedDate)
    : deadLeads;

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">🪦 Dead Leads</h1>

        {/* DEAD DATE FILTER */}
        <div className="mb-6">
          <label className="font-medium text-gray-700 mr-2">Filter by Dead Date:</label>
          <select
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded border"
          >
            <option value="">-- All Dates --</option>
            {deadDates.map(date => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredLeads.length === 0 ? (
          <p className="text-gray-500 italic">No dead leads found{selectedDate ? ' for this date.' : '.'}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLeads.map((lead, idx) => (
              <div key={idx} className="bg-white rounded shadow p-4 border">
                <h2 className="text-lg font-semibold text-gray-800">
                  {lead.leadDetails?.clientName || 'Unnamed Lead'}
                </h2>
                <p className="text-sm text-gray-600">
                  {lead.leadDetails?.contacts?.map((c, i) => (
                    <span key={i}>
                      {c.number} ({c.label || 'Phone'})
                      {i !== lead.leadDetails.contacts.length - 1 && ', '}
                    </span>
                  ))}
                </p>
                <p className="text-sm text-gray-500">
                  {lead.leadDetails?.location || 'No location'}
                </p>
                <p className="text-sm text-gray-500">
                  {lead.leadDetails?.companyName || 'No company name'}
                </p>
                <p className='text-sm text-gray-500 mt-1'>
                  <span className='font-medium'>Created By:</span> {lead.createdBy?.name || 'Unknown'}
                </p>
                {/* Dead Date */}
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Dead Date:</span>{' '}
                  {lead.deadDate
                    ? new Date(lead.deadDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
                {lead.notes && lead.notes.length > 0 && (
                  <div className='mt-2'>
                    <p className="text-sm font-medium text-gray-700">📝 Notes:</p>
                    <ul className='text-sm text-gray-600 list-disc list-inside space-y-1'>
                      {lead.notes.map((note, i) => (
                        <li key={i}>
                          {note.text}{" "}
                          <span className='text-xs text-gray-400'>
                            ({new Date(note.date).toLocaleDateString()})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button
                  onClick={() => handleViewLead(lead)}
                  className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1 rounded"
                >
                  🔍 View Lead
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DeadLeadsPage;
