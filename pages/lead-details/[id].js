import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../../utils/api';

const LeadDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchLead = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/api/leads/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLead(res.data);
      } catch (err) {
        console.error('Error fetching lead:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  if (loading) return <p>Loading lead...</p>;
  if (!lead) return <p>Lead not found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lead Details</h1>
      <p><strong>Name:</strong> {lead.leadDetails?.name}</p>
      <p><strong>Phone:</strong> {lead.leadDetails?.phone}</p>
      <p><strong>Company:</strong> {lead.leadDetails?.company}</p>
      <p><strong>Status:</strong> {lead.status}</p>
      <p><strong>Remarks:</strong> {lead.remarks}</p>
      <p><strong>Date:</strong> {lead.date ? new Date(lead.date).toLocaleDateString() : 'N/A'}</p>
      <p><strong>Created By:</strong> {lead.createdBy?.name}</p>
    </div>
  );
};

export default LeadDetailsPage;
