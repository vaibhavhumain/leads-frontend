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
 {/* Lead Profile Card */}
<motion.div
  className="flex flex-col md:flex-row items-center gap-8 p-8 mb-8 rounded-2xl shadow-lg bg-gradient-to-r from-indigo-100 to-white border border-indigo-200"
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: 0.1 }}
>
  <div className="flex-shrink-0 w-24 h-24 rounded-full bg-indigo-200 flex items-center justify-center text-3xl font-bold text-indigo-700 shadow-inner">
    {lead.leadDetails?.clientName?.[0] || "?"}
  </div>
  <div className="flex-1 space-y-2">
    <h2 className="text-2xl font-bold text-indigo-700">{lead.leadDetails?.clientName || '—'}</h2>
    <div className="flex flex-wrap gap-4 text-sm text-gray-700">
      <span className="font-semibold">📞 {lead.leadDetails?.contacts?.[0]?.number || '—'}</span>
      <span>🏢 {lead.leadDetails?.companyName || '—'}</span>
      <span className="bg-indigo-600/10 text-indigo-700 px-2 py-1 rounded-lg font-medium">
        {lead.status || '—'}
      </span>
      <span>👤 {lead.createdBy?.name || '—'}</span>
    </div>
  </div>
</motion.div>

{/* Activities as Cards */}
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {(activities && activities.length > 0) ? activities.map((activity, idx) => (
    <motion.div
      key={idx}
      className={`rounded-2xl border-l-4 ${
        activity?.type === 'factory_visit'
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-green-400 bg-green-50'
      } shadow p-6 group hover:scale-[1.025] transition-all duration-200`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: idx * 0.07 + 0.2 }}
      whileHover={{ boxShadow: "0 8px 32px rgba(80,0,220,0.12)", scale: 1.03 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-2xl`}>
          {activity?.type === 'factory_visit' ? '🏭' : '🤝'}
        </span>
        <span className="text-lg font-bold text-indigo-700">
          {activity?.type === 'factory_visit' ? 'Factory Visit' : 'In-Person Meeting'}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-600">By: </span>
          {activity?.conductedBy?.name || '-'}
        </div>
        <div>
          <span className="font-medium text-gray-600">Location: </span>
          {activity?.location || '-'}
        </div>
        <div>
          <span className="font-medium text-gray-600">Outcome: </span>
          {activity?.outcome || '-'}
        </div>
        <div>
          <span className="font-medium text-gray-600">Remarks: </span>
          {activity?.remarks || '-'}
        </div>
        <div>
          <span className="font-medium text-gray-600">Date: </span>
          {activity?.date ? new Date(activity.date).toLocaleDateString() : '-'}
        </div>
      </div>
    </motion.div>
  )) : (
    <motion.div
      className="col-span-full rounded-2xl bg-gray-50 border border-gray-200 text-center p-12 text-gray-400 text-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      No activities yet.
    </motion.div>
  )}
</div>
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
