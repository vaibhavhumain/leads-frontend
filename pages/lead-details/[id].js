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

      setLead(leadRes.data.lead || leadRes.data);
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
      className="p-6 max-w-6xl mx-auto text-left bg-white rounded-lg shadow relative"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-3xl font-bold mb-8 text-indigo-700 border-b pb-2"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        Lead Details
      </motion.h1>

      {/* Lead Profile Card */}
      <motion.div
        className="w-full flex flex-col md:flex-row items-center gap-10 p-6 mb-8 bg-white rounded border shadow"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-indigo-700 shadow border">
          {lead.leadDetails?.clientName?.[0] || "?"}
        </div>
        <div className="flex-1 space-y-2">
          <h2 className="text-xl font-semibold text-indigo-800">{lead.leadDetails?.clientName || '—'}</h2>
          <div className="flex flex-wrap gap-3 text-sm text-gray-700">
            <span className="bg-gray-100 px-3 py-1 rounded">{lead.leadDetails?.contacts?.[0]?.number || '—'}</span>
            <span className="bg-gray-100 px-3 py-1 rounded">{lead.leadDetails?.companyName || '—'}</span>
            <span className="bg-gray-100 px-3 py-1 rounded font-semibold">{lead.status || '—'}</span>
            <span className="bg-gray-100 px-3 py-1 rounded">{lead.createdBy?.name || '—'}</span>
          </div>
        </div>
      </motion.div>

      {/* Activities List */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(activities && activities.length > 0) ? activities.map((activity, idx) => (
          <motion.div
            key={idx}
            className={`rounded border-l-4 p-4 bg-white shadow text-sm ${
              activity?.type === 'factory_visit' ? 'border-indigo-400' : 'border-green-400'
            }`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.07 + 0.2 }}
          >
            <h3 className="text-lg font-semibold text-indigo-700 mb-2">
              {activity?.type === 'factory_visit' ? 'Factory Visit' : 'In-Person Meeting'}
            </h3>
            <p><strong>By:</strong> {activity?.conductedBy?.name || '-'}</p>
            <p><strong>Location:</strong> {activity?.location || '-'}</p>
            <p><strong>Outcome:</strong> {activity?.outcome || '-'}</p>
            <p><strong>Remarks:</strong> {activity?.remarks || '-'}</p>
            <p><strong>Date:</strong> {activity?.date ? new Date(activity.date).toLocaleDateString() : '-'}</p>
          </motion.div>
        )) : (
          <motion.div
            className="col-span-full text-center p-12 text-gray-400 bg-gray-100 rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No activities yet.
          </motion.div>
        )}
      </div>

      {/* Add Activity Form */}
      <motion.div
        className="w-full mt-10 p-6 rounded border bg-white shadow"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <h2 className="text-xl font-semibold text-indigo-700 mb-6">Add Visit / Meeting</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            className="border rounded px-4 py-2"
            value={activityForm?.type || ''}
            onChange={e => setActivityForm(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">Select Type</option>
            <option value="factory_visit">Factory Visit</option>
            <option value="in_person_meeting">In-Person Meeting</option>
          </select>
          <input
            type="date"
            className="border rounded px-4 py-2"
            value={activityForm?.date || ''}
            onChange={e => setActivityForm(prev => ({ ...prev, date: e.target.value }))}
          />
          <input
            type="text"
            className="border rounded px-4 py-2"
            placeholder="Location (optional)"
            value={activityForm?.location || ''}
            onChange={e => setActivityForm(prev => ({ ...prev, location: e.target.value }))}
          />
          <input
            type="text"
            className="border rounded px-4 py-2"
            placeholder="Outcome (optional)"
            value={activityForm?.outcome || ''}
            onChange={e => setActivityForm(prev => ({ ...prev, outcome: e.target.value }))}
          />
        </div>
        <textarea
          className="w-full mt-4 p-3 border rounded"
          rows="3"
          placeholder="Remarks (optional)"
          value={activityForm?.remarks || ''}
          onChange={e => setActivityForm(prev => ({ ...prev, remarks: e.target.value }))}
        />
        <button
          onClick={handleAddActivity}
          disabled={addingActivity}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded"
        >
          {addingActivity ? "Adding..." : "Add Activity"}
        </button>
      </motion.div>

      {/* Remarks Section */}
      <motion.div
        className="w-full mt-10 p-6 rounded border bg-white shadow"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
      >
        <h2 className="text-xl font-semibold mb-6 text-indigo-700">Add Remarks</h2>
        <textarea
          className="w-full p-3 border rounded mb-4"
          rows="3"
          placeholder="Share your thoughts or feedback here..."
          value={remarkInput}
          onChange={(e) => setRemarkInput(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="date"
            className="border px-4 py-2 rounded"
            value={remarkDate}
            onChange={(e) => setRemarkDate(e.target.value)}
          />
          <button
            onClick={handleRemarkSubmit}
            disabled={updating}
            className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded disabled:bg-gray-300"
          >
            {updating ? "Saving..." : "Submit Remark"}
          </button>
        </div>

        {/* Remarks History */}
        {lead?.remarksHistory?.length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-semibold text-indigo-700 mb-4">Remarks History</h3>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
              {lead.remarksHistory.map((entry, idx) => (
                <div key={idx} className="p-4 bg-gray-50 border-l-4 border-indigo-400 rounded shadow text-sm">
                  <div className="font-semibold text-blue-700">{entry.updatedBy?.name || 'Unknown'}</div>
                  <div className="italic text-gray-800">"{entry.remarks}"</div>
                  <div className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up section */}
        {lead.createdBy && (
          <div className="mt-6 border-t pt-5">
            <h4 className="text-sm font-medium text-orange-600 mb-2">Forwarded by {lead.createdBy.name}</h4>
            {lead.followUps.filter(fu => fu.by?._id === lead.createdBy._id).length === 0 ? (
              <p className="text-xs text-gray-500 italic">No follow-ups by {lead.createdBy.name}</p>
            ) : (
              lead.followUps
                .filter(fu => fu.by?._id === lead.createdBy._id)
                .map((fup, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 text-sm bg-yellow-50 p-3 mb-2 rounded border border-yellow-200 shadow-sm"
                  >
                    <span className="font-semibold">{fup.date.split('T')[0]}</span>
                    <span className="text-gray-700 text-sm">{fup.notes}</span>
                  </div>
                ))
            )}
          </div>
        )}

        {lead?.isFrozen === false && (
          <p className="text-green-600 mt-6 font-medium italic text-sm">Lead is now unfrozen.</p>
        )}
      </motion.div>
    </motion.div>
  </ProtectedRoute>
);

};

export default LeadDetailsPage;
