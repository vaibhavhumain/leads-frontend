import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../../utils/api';
import { motion } from 'framer-motion';
import {  toast } from 'react-toastify';
const LeadDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarkInput, setRemarkInput] = useState('');
  const [updating, setUpdating] = useState(false);
  const [remarkDate, setRemarkDate] = useState(new Date().toISOString().split("T")[0]); 
  const [users, setUsers] = useState([]);


  useEffect(() => {
  if (!id) return;

  const fetchLead = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch both lead and users
      const [leadRes, usersRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/leads/${id}`, { headers }),
        axios.get(`${BASE_URL}/api/users`, { headers }),
      ]);

      setLead(leadRes.data);
      setUsers(usersRes.data); 
    } catch (err) {
      console.error('Error fetching lead or users:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchLead();
}, [id]);


  const handleRemarkSubmit = async () => {
  const token = localStorage.getItem('token');
  const remarks = remarkInput;
  const status = lead.status;
  const date = remarkDate;

  if (!status || !remarks || !date) {
    toast.warning('Please fill out all fields');
    return;
  }

  try {
    setUpdating(true);
    await axios.put(`${BASE_URL}/api/leads/${id}/status`, {
      status,
      remarks,
      date,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success('Lead updated successfully');
    setRemarkInput(''); // Clear input
    setUpdating(false);
    router.reload(); // reload lead data
  } catch (err) {
    console.error('Error updating remarks:', err.response?.data || err.message);
    toast.error('Failed to update remarks');
    setUpdating(false);
  }
};



  if (loading)
    return <p className="text-center text-gray-500 mt-10">Loading lead...</p>;
  if (!lead)
    return <p className="text-center text-red-500 mt-10">Lead not found</p>;

  const headingVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  return (
    <motion.div
      className="p-6 max-w-6xl mx-auto text-left bg-white rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-3xl font-bold mb-6 text-indigo-600 shadow-lg shadow-indigo-200 p-3 rounded-lg bg-white w-fit mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Lead Details
      </motion.h1>

      {/* Details Table */}
      <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-indigo-100 text-indigo-700">
            <tr>
              {['Name', 'Phone', 'Company', 'Status', 'Remarks', 'Date', 'Created By'].map(
                (label, i) => (
                  <motion.th
                    key={label}
                    className="px-6 py-4 text-left font-semibold"
                    initial="hidden"
                    animate="visible"
                    custom={i}
                    variants={headingVariants}
                  >
                    {label}
                  </motion.th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-6 py-4">{lead.leadDetails?.clientName || '—'}</td>
              <td className="px-6 py-4">{lead.leadDetails?.contact || '—'}</td>
              <td className="px-6 py-4">{lead.leadDetails?.company || '—'}</td>
              <td className="px-6 py-4">{lead.status || '—'}</td>
              <td className="px-6 py-4">{lead.remarks || '—'}</td>
              <td className="px-6 py-4">
                {lead.date ? new Date(lead.date).toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-6 py-4">{lead.createdBy?.name || '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Remarks Input Section */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">Add Remarks</h2>
        <textarea
          className="w-full p-2 border rounded resize-none mb-3"
          rows="3"
          placeholder="Enter your remarks..."
          value={remarkInput}
          onChange={(e) => setRemarkInput(e.target.value)}
        ></textarea>
        <input
  type="date"
  className="mb-3 border rounded px-2 py-1"
  value={remarkDate}
  onChange={(e) => setRemarkDate(e.target.value)}
/>


        <button
          onClick={handleRemarkSubmit}
          disabled={updating}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400 mx-4"
        >
          {updating ? 'Saving...' : 'Submit Remark'}
        </button>
        {lead?.isFrozen === false && (
          <p className="text-green-600 mt-3 font-medium">Lead is now unfrozen.</p>
        )}
      </div>
       {/* <div className="min-h-screen p-6 bg-gray-50">
      <LeadDetailsCard lead={lead} users={users} setLeads={() => {}} />
    </div> */}
    </motion.div>
  );
};

export default LeadDetailsPage;
