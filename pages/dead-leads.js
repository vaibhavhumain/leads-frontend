import { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import Navbar from '../components/Navbar';
import Link from 'next/link';

const DeadLeadsPage = () => {
  const [deadLeads, setDeadLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeadLeads = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/leads/dead-leads`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDeadLeads(res.data.deadLeads);
      } catch (err) {
        console.error("Failed to fetch dead leads:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadLeads();
  }, []);

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
                    <span key={i}>{c.number} ({c.label || 'Phone'})</span>
                  ))}
                </p>
                <p className="text-sm text-gray-500">
                  {lead.leadDetails?.location || 'No location'}
                </p>
                <p className="text-xs text-gray-400 mt-1 italic">
                  Deleted on {new Date(lead.deletedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default DeadLeadsPage;
