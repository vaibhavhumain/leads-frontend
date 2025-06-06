import { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import { toast } from 'react-toastify';
import { 
  FaEye, 
  FaEyeSlash, 
  FaUserCircle,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaMapMarkerAlt,
  FaUserShield,
  FaStickyNote, } from 'react-icons/fa';
import { BsCalendarEvent } from 'react-icons/bs';
import Link from 'next/link';
import { FaArrowRight } from "react-icons/fa";

const LeadDetails = () => {
  const [lead, setLead] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedConnection, setSelectedConnection] = useState('');
  const [followUp, setFollowUp] = useState({ date: '', notes: '' });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [showFollowUps, setShowFollowUps] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    setLoggedInUserId(parsedUser._id); 
  }
}, []);


  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  const fetchLead = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${BASE_URL}/api/leads/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLead(res.data);
    setSelectedStatus(res.data.status || '');
    setSelectedConnection(res.data.connectionStatus || '');
    localStorage.setItem('selectedLead', JSON.stringify(res.data));
  } catch (err) {
    console.error("Failed to fetch lead", err);
  }
};


useEffect(() => {
  const storedLead = localStorage.getItem('selectedLead');
  if (storedLead) {
    const parsedLead = JSON.parse(storedLead);
    fetchLead(parsedLead._id); 
  }
}, []);


  const handleAddFollowUp = async () => {
  const token = localStorage.getItem('token');
  if (!followUp.date || !followUp.notes) {
    toast.warning('Please fill out both date and notes');
    return;
  }

  try {
    // Add follow-up
    await axios.post(
      `${BASE_URL}/api/leads/followup`,
      {
        leadId: lead._id,
        followUp,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success('Follow-up added');

    const res = await axios.get(`${BASE_URL}/api/leads/${lead._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFollowUp({ date: '', notes: '' });
    setLead(res.data);
    localStorage.setItem('selectedLead', JSON.stringify(res.data));

  } catch (err) {
    toast.error('Failed to add follow-up');
    console.error(err);
  }
};


  const handleStatusUpdate = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.put(`${BASE_URL}/api/leads/${lead._id}/status`, {
      status: selectedStatus,
    }, { headers: { Authorization: `Bearer ${token}` } });

    toast.success('Status updated');

    const updatedLead = { ...lead, status: selectedStatus };
    setLead(updatedLead);
    localStorage.setItem('selectedLead', JSON.stringify(updatedLead));

  } catch (err) {
    toast.error('Error updating status');
    console.error(err);
  }
};


 const handleConnectionUpdate = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.put(`${BASE_URL}/api/leads/${lead._id}/connection-status`, {
      connectionStatus: selectedConnection,
    }, { headers: { Authorization: `Bearer ${token}` } });

    toast.success('Connection updated');

    const updatedLead = { ...lead, connectionStatus: selectedConnection };
    setLead(updatedLead);
    localStorage.setItem('selectedLead', JSON.stringify(updatedLead));

  } catch (err) {
    toast.error('Error updating connection');
    console.error(err);
  }
};


  const handleForward = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${BASE_URL}/api/leads/forward`,
        {
          leadId: lead._id,
          userId: selectedUserId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Lead forwarded');
      fetchLead(lead._id);
    } catch (err) {
      toast.error('Forwarding failed');
      console.error(err);
    }
  };

  if (!lead) return <p>Loading lead...</p>;

  return (
    
  <div className="relative min-h-screen w-full bg-gradient-to-br from-rose-100 via-red-100 to-pink-200 py-16 px-4 flex items-start justify-center overflow-hidden font-sans">
    {/* Background blobs */}
    <div className="absolute top-0 left-0 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
    <div className="absolute top-1/3 right-0 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20" />
    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
    <Link href="/dashboard">
  <button className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg font-semibold transition">
    <FaArrowRight />
    Go to Dashboard
  </button>
</Link>
    {/* Lead Card */}
    <div
      className="relative z-10 bg-white/80 p-8 rounded-3xl shadow-2xl border border-blue-100 w-full max-w-2xl backdrop-blur-lg transition hover:shadow-blue-200"
      style={{
        backgroundImage:
          'linear-gradient(to right top, #ffffff, #f2f6ff, #e2eeff, #cde6ff, #b3dfff)',
      }}
    >
      <h2 className="text-2xl font-extrabold text-blue-700 mb-6 flex items-center gap-2">
        <FaUserCircle /> Lead Card Details
      </h2>

      <div className="text-sm text-gray-800 space-y-2 mb-6">
        <p><FaUser className="inline mr-2 text-blue-600" /> <strong>Client:</strong> {lead.leadDetails?.clientName || 'N/A'}</p>
        <p><FaPhone className="inline mr-2 text-green-600" /> <strong>Contact:</strong> {lead.leadDetails?.contact || 'N/A'}</p>
        <p><FaEnvelope className="inline mr-2 text-red-600" /> <strong>Email:</strong> {lead.leadDetails?.email || 'N/A'}</p>
        <p><FaBuilding className="inline mr-2 text-indigo-600" /> <strong>Company:</strong> {lead.leadDetails?.companyName || 'N/A'}</p>
        <p><FaMapMarkerAlt className="inline mr-2 text-pink-600" /> <strong>Location:</strong> {lead.leadDetails?.location || 'N/A'}</p>
        <p><FaUserShield className="inline mr-2 text-gray-600" /> <strong>Created By:</strong> {lead.createdBy?.name || 'N/A'}</p>
      </div>

      {/* Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">🎯 Status</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full border border-blue-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
        >
          <option value="">-- Select Status --</option>
          <option value="Hot">🔥 Hot</option>
          <option value="Warm">🌤 Warm</option>
          <option value="Cold">❄️ Cold</option>
        </select>
        <button
          onClick={handleStatusUpdate}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded shadow-md font-semibold"
        >
          💾 Save Status
        </button>
      </div>

      {/* Connection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">🔌 Connection</label>
        <select
          value={selectedConnection}
          onChange={(e) => setSelectedConnection(e.target.value)}
          className="w-full border border-green-300 px-3 py-2 rounded focus:ring-2 focus:ring-green-400"
        >
          <option value="">-- Select Connection --</option>
          <option value="Connected">✅ Connected</option>
          <option value="Not Connected">❌ Not Connected</option>
        </select>
        <button
          onClick={handleConnectionUpdate}
          className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded shadow-md font-semibold"
        >
          💾 Save Connection
        </button>
      </div>

      {/* Follow-Up Section */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Add Follow-Up</label>
        <input
          type="date"
          value={followUp.date}
          onChange={(e) => setFollowUp({ ...followUp, date: e.target.value })}
          className="w-full border border-gray-300 px-3 py-2 rounded mb-2 focus:ring-2 focus:ring-purple-300"
        />
        <textarea
          placeholder="✍️ Enter follow-up notes"
          rows="3"
          value={followUp.notes}
          onChange={(e) => setFollowUp({ ...followUp, notes: e.target.value })}
          className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-purple-300"
        />
        <button
          onClick={handleAddFollowUp}
          className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-medium shadow-md transition"
        >
          ➕ Add Follow-Up
        </button>
      </div>

      {/* Follow-Up Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowFollowUps(!showFollowUps)}
          className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:underline"
        >
          {showFollowUps ? <><FaEyeSlash /> Hide Follow-Ups</> : <><FaEye /> Show Follow-Ups</>}
        </button>
      </div>

      {showFollowUps && (
  <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 rounded-xl shadow-inner border border-blue-100 mb-6">
    <h3 className="text-base font-semibold text-purple-700 mb-4 flex items-center gap-2">
      <FaStickyNote /> Follow-Up History
    </h3>

   {/* Follow-ups by the assigned user
{lead.forwardedTo?.user?._id && (

  <div className="mt-6">
    <h4 className="text-sm font-semibold text-green-600 mb-2">
      📩 By {lead.forwardedTo.user.name} (Assigned user)
    </h4>
    {lead.followUps.filter(fu => fu.by?._id === lead.forwardedTo.user._id).length === 0 ? (
      <p className="text-xs text-gray-500 italic">No follow-ups by {lead.forwardedTo.user.name}</p>
    ) : (
      lead.followUps
        .filter(fu => fu.by?._id === lead.forwardedTo.user._id)
        .map((fup, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 text-sm bg-white px-4 py-3 mb-2 rounded-lg shadow-sm border border-gray-200"
          >
            <span className="font-medium text-gray-800">{fup.date?.split('T')[0]}</span>
            <span className="text-gray-600 text-xs">📝 {fup.notes}</span>
          </div>
        ))
    )}
  </div>
)} */}

    {/* 🧑‍💼 Follow-ups by the person who forwarded the lead (createdBy) */}
    {lead.createdBy && (
      <div>
        <h4 className="text-sm font-semibold text-blue-700 mb-2">
          🧑‍💼 By {lead.createdBy.name} (Forwarded the Lead)
        </h4>
        {lead.followUps.filter(f => f.by?._id === lead.createdBy._id).length === 0 ? (
          <p className="text-xs text-gray-500 italic">
            No follow-ups by {lead.createdBy.name}
          </p>
        ) : (
          lead.followUps
            .filter(f => f.by?._id === lead.createdBy._id)
            .map((fup, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 text-sm bg-white px-4 py-3 mb-2 rounded-lg shadow-sm border border-gray-200"
              >
                <BsCalendarEvent className="text-blue-500 mt-1" />
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">
                    {fup.date?.split('T')[0] || 'No Date'}
                  </span>
                  <span className="text-gray-600 text-xs">📝 {fup.notes}</span>
                </div>
              </div>
            ))
        )}
      </div>
    )}
  </div>
)}

      {/* Forward Section */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">📤 Forward Lead</label>
        <select
  value={selectedUserId}
  onChange={(e) => setSelectedUserId(e.target.value)}
  className="w-full border border-orange-300 px-3 py-2 rounded focus:ring-2 focus:ring-orange-400"
>
  <option value="">-- Select User --</option>
  {users
    .filter((user) => user._id !== loggedInUserId)
    .map((user) => (
      <option key={user._id} value={user._id}>
        {user.name}
      </option>
    ))}
</select>

        <button
          onClick={handleForward}
          className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded shadow-md font-semibold"
        >
          📨 Forward Lead
        </button>
      </div>
    </div>
  </div>
);
};

export default LeadDetails;

