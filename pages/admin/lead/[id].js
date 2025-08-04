
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../../components/Navbar';
import ProtectedRoute from '../../../components/ProtectedRoute';
import BASE_URL from '../../../utils/api';

const LeadDetails = () => {
  const router = useRouter();
  const { id } = router.query;

  const [lead, setLead] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchLead = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const userRes = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        setLoggedInUser(userRes.data);

        const res = await axios.get(`${BASE_URL}/api/leads/${id}`, { headers });
        setLead(res.data);
      } catch (err) {
        console.error('Failed to load lead', err);
      }
    };

    fetchLead();
  }, [id]);

  if (loggedInUser && loggedInUser.role !== 'admin') {
    return <div className="text-red-500 text-center mt-10 font-bold">🚫 Access Denied</div>;
  }

  if (!lead) return <div className="text-center mt-10 text-gray-500">Loading lead details...</div>;

  return (
    <ProtectedRoute>
      <Navbar loggedInUser={loggedInUser} />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-700 mb-4">Lead Details: {lead.leadDetails?.clientName}</h1>

        <div className="bg-white p-4 rounded-xl shadow mb-6">
          <p><strong>📞 Phone:</strong> {lead.leadDetails?.contacts?.map(c => c.number).join(', ')}</p>
          <p><strong>🏢 Company:</strong> {lead.leadDetails?.companyName}</p>
          <p><strong>📍 Location:</strong> {lead.leadDetails?.location}</p>
          <p><strong>📧 Email:</strong> {lead.leadDetails?.email}</p>
          <p><strong>📝 Status:</strong> {lead.status}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-blue-600 mb-2">📆 Follow Ups</h2>
            <ul className="list-disc ml-6 space-y-1">
              {lead.followUps?.length > 0 ? (
                lead.followUps.map((f, i) => (
                  <li key={i}>{f.text} - <span className="text-xs text-gray-500">{new Date(f.date).toLocaleString()}</span></li>
                ))
              ) : (
                <p className="italic text-sm text-gray-400">No follow-ups</p>
              )}
            </ul>
          </div>

          <div className="bg-green-50 p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold text-green-600 mb-2">📅 Meetings</h2>
            <ul className="list-disc ml-6 space-y-1">
              {lead.meetings?.length > 0 ? (
                lead.meetings.map((m, i) => (
                  <li key={i}>{m.agenda} - <span className="text-xs text-gray-500">{new Date(m.date).toLocaleString()}</span></li>
                ))
              ) : (
                <p className="italic text-sm text-gray-400">No meetings</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default LeadDetails;
