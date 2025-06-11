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
    <Navbar />
    <motion.div
      className="p-8 max-w-6xl mx-auto text-left bg-gradient-to-br from-[#f6f7fa] via-[#e5e9f7] to-[#e0e7ff] rounded-[2.5rem] shadow-2xl relative overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Blurred background shapes for glassmorphism */}
      <div className="absolute -top-20 -left-20 w-[320px] h-[320px] bg-indigo-300/30 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-[-80px] right-[-80px] w-[340px] h-[340px] bg-gradient-to-br from-yellow-100 via-yellow-300 to-indigo-300 opacity-30 rounded-full blur-3xl z-0" />

      {/* Title */}
      <motion.h1
        className="text-4xl font-extrabold mb-8 text-indigo-700 p-4 bg-white/80 rounded-2xl shadow-lg w-fit mx-auto tracking-tight drop-shadow-lg border-b-4 border-indigo-200"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span className="bg-gradient-to-r from-indigo-500 via-blue-400 to-yellow-300 bg-clip-text text-transparent">
          🚀 Lead Details
        </span>
      </motion.h1>

      {/* Lead Profile Card */}
      <motion.div
  className="w-full flex flex-col md:flex-row items-center gap-10 p-8 mb-8 rounded-[2rem] shadow-2xl bg-white/80 backdrop-blur-lg border border-indigo-100 relative z-10"
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: 0.1 }}
>
        <div className="flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-200 via-yellow-100 to-white flex items-center justify-center text-3xl font-extrabold text-indigo-700 shadow-lg border-2 border-indigo-100">
          {lead.leadDetails?.clientName?.[0] || "?"}
        </div>
        <div className="flex-1 space-y-3">
          <h2 className="text-2xl font-bold text-indigo-800 drop-shadow">{lead.leadDetails?.clientName || '—'}</h2>
          <div className="flex flex-wrap gap-4 text-base text-gray-700">
            <span className="bg-indigo-100/70 px-3 py-1 rounded-lg font-semibold flex items-center gap-2">
              📞 {lead.leadDetails?.contacts?.[0]?.number || '—'}
            </span>
            <span className="bg-yellow-100/70 px-3 py-1 rounded-lg font-semibold flex items-center gap-2">
              🏢 {lead.leadDetails?.companyName || '—'}
            </span>
            <span className="bg-gradient-to-r from-indigo-400 to-yellow-200 text-white px-3 py-1 rounded-lg font-bold shadow">
              {lead.status || '—'}
            </span>
            <span className="bg-gray-100 px-3 py-1 rounded-lg font-medium flex items-center gap-2">
              👤 {lead.createdBy?.name || '—'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Activities as Glassy Cards */}
<div className="w-full grid gap-6 md:grid-cols-2 lg:grid-cols-3 relative z-10">
        {(activities && activities.length > 0) ? activities.map((activity, idx) => (
          <motion.div
            key={idx}
            className={`rounded-2xl border-l-[5px] ${
              activity?.type === 'factory_visit'
                ? 'border-indigo-400 bg-white/70'
                : 'border-green-400 bg-gradient-to-r from-green-100/80 to-white/80'
            } shadow-lg group hover:scale-[1.035] hover:shadow-2xl transition-all duration-200 backdrop-blur-md`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.07 + 0.2 }}
            whileHover={{ boxShadow: "0 10px 36px rgba(60,80,210,0.12)", scale: 1.035 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">
                {activity?.type === 'factory_visit' ? '🏭' : '🤝'}
              </span>
              <span className="text-lg font-bold text-indigo-700">
                {activity?.type === 'factory_visit' ? 'Factory Visit' : 'In-Person Meeting'}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium text-gray-600">By: </span>{activity?.conductedBy?.name || '-'}</div>
              <div><span className="font-medium text-gray-600">Location: </span>{activity?.location || '-'}</div>
              <div><span className="font-medium text-gray-600">Outcome: </span>{activity?.outcome || '-'}</div>
              <div><span className="font-medium text-gray-600">Remarks: </span>{activity?.remarks || '-'}</div>
              <div><span className="font-medium text-gray-600">Date: </span>{activity?.date ? new Date(activity.date).toLocaleDateString() : '-'}</div>
            </div>
          </motion.div>
        )) : (
          <motion.div
            className="col-span-full rounded-2xl bg-indigo-50 border border-indigo-200 text-center p-12 text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No activities yet.
          </motion.div>
        )}
      </div>

      {/* Add Factory Visit / Meeting */}
     <motion.div
  className="w-full mt-12 mb-10 px-7 py-8 rounded-[2rem] shadow-2xl border border-indigo-200/30 bg-white/80 backdrop-blur-md relative z-10 hover:shadow-indigo-200/60 transition-shadow duration-300"
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.15 }}
>
  {/* Top gradient bar for accent */}
  <div className="absolute -top-2 left-6 right-6 h-1 rounded-lg bg-gradient-to-r from-indigo-400 via-yellow-200 to-indigo-400 opacity-70 blur-[1.5px] mb-4" />

  <h2 className="text-2xl font-extrabold text-indigo-700 mb-7 flex items-center gap-3 tracking-tight drop-shadow-md">
    <span className="text-3xl">🪄</span>
    Add Visit / Meeting
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
    <select
      className="border-2 border-indigo-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-300 bg-white/70 shadow-sm transition-all"
      value={activityForm?.type || ''}
      onChange={e => setActivityForm(prev => ({ ...prev, type: e.target.value }))}
    >
      <option value="">— Select Type —</option>
      <option value="factory_visit">🏭 Factory Visit</option>
      <option value="in_person_meeting">🤝 In-Person Meeting</option>
    </select>
    <input
      type="date"
      className="border-2 border-indigo-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-300 bg-white/70 shadow-sm transition-all"
      value={activityForm?.date || ''}
      onChange={e => setActivityForm(prev => ({ ...prev, date: e.target.value }))}
    />
    <input
      type="text"
      className="border-2 border-indigo-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-300 bg-white/70 shadow-sm transition-all"
      placeholder="Location (optional)"
      value={activityForm?.location || ''}
      onChange={e => setActivityForm(prev => ({ ...prev, location: e.target.value }))}
    />
    <input
      type="text"
      className="border-2 border-indigo-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-300 bg-white/70 shadow-sm transition-all"
      placeholder="Outcome (optional)"
      value={activityForm?.outcome || ''}
      onChange={e => setActivityForm(prev => ({ ...prev, outcome: e.target.value }))}
    />
  </div>
  <textarea
    className="w-full mt-6 p-4 border-2 border-indigo-100 rounded-xl bg-white/70 shadow-sm resize-none focus:ring-2 focus:ring-indigo-300"
    rows="3"
    placeholder="Remarks (optional)"
    value={activityForm?.remarks || ''}
    onChange={e => setActivityForm(prev => ({ ...prev, remarks: e.target.value }))}
  />
  <button
    className="mt-6 w-full bg-gradient-to-r from-indigo-600 via-yellow-400 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg text-lg transition-all duration-200 active:scale-95"
    onClick={handleAddActivity}
    disabled={addingActivity}
  >
    {addingActivity ? (
      <span className="inline-flex gap-2 items-center">
        <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        Adding...
      </span>
    ) : (
      <>✨ Add Activity</>
    )}
  </button>
</motion.div>


      {/* Remarks Input Section */}
<motion.div
  className="w-full mt-10 bg-white/80 p-10 rounded-[2rem] border-2 border-indigo-100 shadow-2xl relative z-10 backdrop-blur-lg"
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.18 }}
>
  {/* Accent bar */}
  <div className="absolute left-7 right-7 -top-2 h-1 bg-gradient-to-r from-indigo-400 via-yellow-200 to-blue-400 rounded-xl opacity-60 blur-[1.5px]" />

  <h2 className="text-2xl font-extrabold mb-8 text-indigo-700 flex items-center gap-3 tracking-tight drop-shadow-md">
    <span className="text-3xl">🗒️</span> Add Remarks
  </h2>
  
  <textarea
    className="w-full p-4 border-2 border-indigo-100 rounded-xl bg-white/70 resize-none mb-5 focus:ring-2 focus:ring-indigo-200 text-base shadow"
    rows="3"
    placeholder="Share your thoughts or feedback here..."
    value={remarkInput}
    onChange={(e) => setRemarkInput(e.target.value)}
  ></textarea>
  
  <div className="flex flex-col sm:flex-row gap-4 mb-5">
    <input
      type="date"
      className="border-2 border-indigo-100 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-200 bg-white/80 shadow transition-all"
      value={remarkDate}
      onChange={(e) => setRemarkDate(e.target.value)}
    />
    <button
      onClick={handleRemarkSubmit}
      disabled={updating}
      className="flex-1 px-8 py-3 bg-gradient-to-r from-indigo-600 via-yellow-400 to-blue-600 text-white rounded-xl shadow-lg font-bold text-base hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 active:scale-95 disabled:bg-gray-300"
    >
      {updating ? (
        <span className="inline-flex gap-2 items-center">
          <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-70" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          Saving...
        </span>
      ) : (
        <>Submit Remark</>
      )}
    </button>
  </div>

  {/* lead remarks history */}
  {lead?.remarksHistory?.length > 0 && (
    <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white/70 to-yellow-50/80 border border-indigo-200/70 shadow-xl relative overflow-hidden">
      {/* Tiny left accent bar */}
      <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-indigo-400 to-yellow-200 rounded-full opacity-40" />
      <h3 className="text-xl font-bold text-indigo-900 mb-5 flex items-center gap-3">
        <span className="text-2xl">📜</span> Remarks History
      </h3>
      <div className="space-y-5 max-h-72 overflow-y-auto pr-2">
        {lead.remarksHistory.map((entry, idx) => (
          <div
            key={idx}
            className="p-5 bg-white/90 border-l-4 border-indigo-400 rounded-xl shadow text-base flex flex-col gap-1"
          >
            <span className="flex items-center gap-2 font-semibold text-blue-700">
              👤 {entry.updatedBy?.name || 'Unknown'}
            </span>
            <span className="text-gray-800 italic mb-1">"{entry.remarks}"</span>
            <span className="text-xs text-gray-500">
              📅 {new Date(entry.date).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
      {/* Forwarded By Section inside Remarks History */}
      {lead.createdBy && (
        <div className="mt-10">
          <h4 className="text-base font-semibold text-orange-600 mb-2 flex items-center gap-2">
            <span>📤</span> Forwarded by {lead.createdBy.name}
          </h4>
          {lead.followUps.filter(fu => fu.by?._id === lead.createdBy._id).length === 0 ? (
            <p className="text-xs text-gray-500 italic">No follow-ups by {lead.createdBy.name}</p>
          ) : (
            lead.followUps
              .filter(fu => fu.by?._id === lead.createdBy._id)
              .map((fup, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 text-sm bg-yellow-50/80 p-4 mb-2 rounded-xl border border-yellow-200 shadow-sm"
                >
                  <span className="font-semibold text-gray-800">{fup.date.split('T')[0]}</span>
                  <span className="text-gray-600 text-xs">📝 {fup.notes}</span>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  )}

  {lead?.isFrozen === false && (
    <p className="text-green-600 mt-6 font-medium italic text-base">✅ Lead is now unfrozen.</p>
  )}
</motion.div>
    </motion.div>
  </ProtectedRoute>
);
};

export default LeadDetailsPage;
