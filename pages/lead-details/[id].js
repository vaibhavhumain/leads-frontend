import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../../utils/api';
import { motion } from 'framer-motion';
import {  toast } from 'react-toastify';
import ProtectedRoute from '../../components/ProtectedRoute';
import Navbar from '../../components/Navbar';
const LeadDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarkInput, setRemarkInput] = useState('');
  const [updating, setUpdating] = useState(false);
  const [remarkDate, setRemarkDate] = useState(new Date().toISOString().split("T")[0]); 
  const [users, setUsers] = useState([]);
  const [totalLeadsUploaded , setTotalLeadsUploaded] = useState();
  const [activities, setActivities] = useState([]); 
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityForm, setActivityForm] = useState({
  type: '',
  date: '',
  location: '',
  remarks: '',
  outcome: '',
});
const [addingActivity, setAddingActivity] = useState(false);

const handleAddActivity = async () => {
  const token = localStorage.getItem('token');
  if (!activityForm.type || !activityForm.date) {
    toast.warning('Please select a type and date');
    return;
  }
  try {
    setAddingActivity(true);
    await axios.post(`${BASE_URL}/api/leads/${id}/activities`, activityForm, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success('Activity added!');
    setActivityForm({ type: '', date: '', location: '', remarks: '', outcome: '' });

    // Refresh activities
    const res = await axios.get(`${BASE_URL}/api/leads/${id}/activities`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setActivities(res.data.activities || []);
  } catch (err) {
    toast.error('Failed to add activity');
    console.error(err);
  } finally {
    setAddingActivity(false);
  }
};


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

useEffect(() => {
  if (!id) return;
  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/leads/${id}/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActivities(res.data.activities || []);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };
  fetchActivities();
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
    <ProtectedRoute>
      <Navbar/>
    <motion.div
  className="p-6 max-w-6xl mx-auto text-left bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl"
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <motion.h1
    className="text-4xl font-bold mb-8 text-indigo-700 p-4 bg-white rounded-xl shadow-lg w-fit mx-auto tracking-tight"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
  >
    🚀 Lead Details
  </motion.h1>

      {/* Details Table */}
<div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200 bg-white">
  <table className="min-w-full text-sm text-gray-800">
    <thead className="bg-indigo-100 text-indigo-800">
      <tr>
        <motion.th
          className="px-6 py-4 text-left font-semibold tracking-wide"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={headingVariants}
        >Name</motion.th>
        <motion.th
          className="px-6 py-4 text-left font-semibold tracking-wide"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={headingVariants}
        >Phone</motion.th>
        <motion.th
          className="px-6 py-4 text-left font-semibold tracking-wide"
          initial="hidden"
          animate="visible"
          custom={2}
          variants={headingVariants}
        >Company</motion.th>
        <motion.th
          className="px-6 py-4 text-left font-semibold tracking-wide"
          initial="hidden"
          animate="visible"
          custom={3}
          variants={headingVariants}
        >Status</motion.th>
        <motion.th
          className="px-6 py-4 text-left font-semibold tracking-wide"
          initial="hidden"
          animate="visible"
          custom={4}
          variants={headingVariants}
        >Date</motion.th>
        <motion.th
          className="px-6 py-4 text-left font-semibold tracking-wide"
          initial="hidden"
          animate="visible"
          custom={5}
          variants={headingVariants}
        >Created By</motion.th>
        {/* Add columns for Activity below */}
        <motion.th
          className="px-6 py-4 text-left font-semibold tracking-wide"
          initial="hidden"
          animate="visible"
          custom={6}
          variants={headingVariants}
        >Activity Type</motion.th>
        <motion.th
          className="px-6 py-4 text-left font-semibold tracking-wide"
          initial="hidden"
          animate="visible"
          custom={7}
          variants={headingVariants}
        >By</motion.th>
        <motion.th
          className="px-6 py-4 text-left font-semibold tracking-wide"
          initial="hidden"
          animate="visible"
          custom={8}
          variants={headingVariants}
        >Location</motion.th>
        <motion.th
          className="px-6 py-4 text-left font-semibold tracking-wide"
          initial="hidden"
          animate="visible"
          custom={9}
          variants={headingVariants}
        >Outcome</motion.th>
        <motion.th
          className="px-6 py-4 text-left font-semibold tracking-wide"
          initial="hidden"
          animate="visible"
          custom={10}
          variants={headingVariants}
        >Remarks</motion.th>
      </tr>
    </thead>
    <tbody>
  {(activities && activities.length > 0 ? activities : [null]).map((activity, idx) => (
    <tr key={idx} className={activity ? "bg-blue-50" : "bg-white"}>
      {/* Name */}
      <td className="px-6 py-4 font-bold text-indigo-900">
        {lead.leadDetails?.clientName || '—'}
      </td>
      {/* Phone */}
      <td className="px-6 py-4">
        {lead.leadDetails?.contacts && lead.leadDetails.contacts.length > 0
          ? lead.leadDetails.contacts.map((c, i) => (
              <div key={i} style={{ whiteSpace: 'nowrap' }}>
                <span
                  style={{
                    fontWeight: i === 0 ? 700 : 400,
                    display: 'inline-block',
                  }}
                >
                  {c.number}
                </span>
                <span className="ml-1 text-xs text-gray-500">
                  ({c.label})
                </span>
                {i === 0 && <br />}
              </div>
            ))
          : lead.leadDetails?.contact || '—'}
      </td>
      {/* Company */}
      <td className="px-6 py-4">{lead.leadDetails?.companyName || '—'}</td>
      {/* Status */}
      <td className="px-6 py-4">{lead.status || '—'}</td>
      {/* Date */}
      <td className="px-6 py-4">
        {lead.date ? new Date(lead.date).toLocaleDateString() : 'N/A'}
      </td>
      {/* Created By */}
      <td className="px-6 py-4">{lead.createdBy?.name || '—'}</td>
      {/* Activity Type */}
      <td className="px-6 py-4 font-semibold">
        {activity
          ? activity.type === 'factory_visit'
            ? (<span>🏭 <b>Factory Visit</b></span>)
            : (<span>🤝 <b>In-Person Meeting</b></span>)
          : <span className="text-gray-400">No activity</span>
        }
      </td>
      {/* By */}
      <td className="px-6 py-4">{activity?.conductedBy?.name || '-'}</td>
      {/* Location */}
      <td className="px-6 py-4">{activity?.location || '-'}</td>
      {/* Outcome */}
      <td className="px-6 py-4">{activity?.outcome || '-'}</td>
      {/* Remarks */}
      <td className="px-6 py-4">{activity?.remarks || '-'}</td>
    </tr>
  ))}
</tbody>
  </table>
</div>


      {/* Add Factory Visit / Meeting */}
<div className="mt-8 mb-8 bg-white p-6 rounded-2xl border border-blue-100 shadow-md">
  <h2 className="text-lg font-semibold text-indigo-700 mb-4">➕ Add Visit / Meeting</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <select
      className="border rounded-lg px-3 py-2"
      value={activityForm?.type || ''}
      onChange={e => setActivityForm(prev => ({ ...prev, type: e.target.value }))}
    >
      <option value="">-- Select Type --</option>
      <option value="factory_visit">🏭 Factory Visit</option>
      <option value="in_person_meeting">🤝 In-Person Meeting</option>
    </select>
    <input
      type="date"
      className="border rounded-lg px-3 py-2"
      value={activityForm?.date || ''}
      onChange={e => setActivityForm(prev => ({ ...prev, date: e.target.value }))}
    />
    <input
      type="text"
      className="border rounded-lg px-3 py-2"
      placeholder="Location (optional)"
      value={activityForm?.location || ''}
      onChange={e => setActivityForm(prev => ({ ...prev, location: e.target.value }))}
    />
    <input
      type="text"
      className="border rounded-lg px-3 py-2"
      placeholder="Outcome (optional)"
      value={activityForm?.outcome || ''}
      onChange={e => setActivityForm(prev => ({ ...prev, outcome: e.target.value }))}
    />
  </div>
  <textarea
    className="w-full mt-4 p-3 border rounded-lg resize-none"
    rows="2"
    placeholder="Remarks (optional)"
    value={activityForm?.remarks || ''}
    onChange={e => setActivityForm(prev => ({ ...prev, remarks: e.target.value }))}
  />
  <button
    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
    onClick={handleAddActivity}
    disabled={addingActivity}
  >
    {addingActivity ? 'Adding...' : 'Add Activity'}
  </button>
</div>


      {/* Remarks Input Section */}
      <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
  <h2 className="text-xl font-semibold mb-4 text-indigo-700">🗒️ Add Remarks</h2>
  <textarea
    className="w-full p-3 border rounded-lg resize-none mb-4 focus:ring-2 focus:ring-indigo-300"
    rows="3"
    placeholder="Enter your remarks..."
    value={remarkInput}
    onChange={(e) => setRemarkInput(e.target.value)}
  ></textarea>
  <input
    type="date"
    className="mb-4 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
    value={remarkDate}
    onChange={(e) => setRemarkDate(e.target.value)}
  />
  <button
    onClick={handleRemarkSubmit}
    disabled={updating}
    className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 disabled:bg-gray-400 transition"
  >
    {updating ? 'Saving...' : 'Submit Remark'}
  </button>

{/* lead remarks history */}
{lead?.remarksHistory?.length > 0 && (
  <div className="mt-10 p-6 rounded-2xl bg-indigo-50 border border-indigo-200 shadow-inner">
    <h3 className="text-lg font-semibold text-indigo-800 mb-4">📜 Remarks History</h3>
    
    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
      {lead.remarksHistory.map((entry, idx) => (
        <div
          key={idx}
          className="p-4 bg-white border rounded-xl shadow-sm text-sm"
        >
          <p className="flex items-center gap-2 font-semibold text-blue-600 mb-1">
            👤 {entry.updatedBy?.name || 'Unknown'}
          </p>
          <p className="text-gray-800 italic mb-1">"{entry.remarks}"</p>
          <p className="text-xs text-gray-500">📅 {new Date(entry.date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>

    {/* Forwarded By Section inside Remarks History */}
    {lead.createdBy && (
      <div className="mt-8">
        <h4 className="text-sm font-semibold text-orange-600 mb-2">📤 Forwarded by {lead.createdBy.name}</h4>
        {lead.followUps.filter(fu => fu.by?._id === lead.createdBy._id).length === 0 ? (
          <p className="text-xs text-gray-500 italic">No follow-ups by {lead.createdBy.name}</p>
        ) : (
          lead.followUps
            .filter(fu => fu.by?._id === lead.createdBy._id)
            .map((fup, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 text-sm bg-white p-4 mb-2 rounded-xl border border-gray-200 shadow-sm"
              >
                <span className="font-medium text-gray-800">{fup.date.split('T')[0]}</span>
                <span className="text-gray-600 text-xs">📝 {fup.notes}</span>
              </div>
            ))
        )}
      </div>
    )}
  </div>
)}


        {lead?.isFrozen === false && (
  <p className="text-green-600 mt-4 font-medium italic">✅ Lead is now unfrozen.</p>
)}
      </div>
    </motion.div>
    </ProtectedRoute>
  );
};

export default LeadDetailsPage;
