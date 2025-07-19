import { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import Navbar from '../components/Navbar';
import { useRouter } from 'next/router';

const DeadLeadsPage = () => {
  const [deadLeads, setDeadLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDeadLeads = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/leads/dead-leads?status=dead`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDeadLeads(res.data.leads);
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">🪦 Dead Leads</h1>

        {loading ? (
          <p>Loading...</p>
        ) : deadLeads.length === 0 ? (
          <p className="text-gray-500 italic">No dead leads found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deadLeads.map((lead, idx) => (
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
                {lead.notes && lead.notes.length>0 && (
                  <div className='mt-2'>
                    <p className="text-sm font medium text-gray-700">📝 Notes:</p>
                    <ul className='text-sm text-gray-600 list-dsc list-inside space-y-1'>
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
