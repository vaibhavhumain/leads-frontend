import { useEffect, useState } from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaStickyNote } from 'react-icons/fa';
import { BsCalendarEvent } from 'react-icons/bs';

const leadDetails = () => {
  const [lead, setLead] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedConnection, setSelectedConnection] = useState('');
  const [followUp, setFollowUp] = useState({ date: '', notes: '' });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [showFollowUps, setShowFollowUps] = useState(true);

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

  const fetchLead = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${BASE_URL}/api/leads/${lead._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLead(res.data);
    setSelectedStatus(res.data.status || '');
    setSelectedConnection(res.data.connectionStatus || '');
  } catch (err) {
    console.error("Failed to fetch lead", err);
  }
};

  useEffect(() => {
  const storedLead = localStorage.getItem('selectedLead');
  if (storedLead) {
    const parsedLead = JSON.parse(storedLead);
    setLead(parsedLead);
    setSelectedStatus(parsedLead.status || '');
    setSelectedConnection(parsedLead.connectionStatus || '');
  }
}, []);


  const handleAddFollowUp = async () => {
    const token = localStorage.getItem('token');
    if (!followUp.date || !followUp.notes) {
      toast.warning('Please fill out both date and notes');
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/api/leads/followup`,
        {
          leadId: lead._id,
          followUp,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Follow-up added');
      fetchLead(lead._id);
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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-rose-100 via-red-100 to-pink-200 py-12 px-4 flex items-start justify-center">
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-2xl opacity-20" />

      <div
        className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl mx-auto hover:shadow-2xl transition duration-300"
        style={{
          backgroundImage:
            'linear-gradient(to right top, #ffffff, #f2f6ff, #e2eeff, #cde6ff, #b3dfff)',
        }}
      >
        <h2 className="text-xl font-bold text-blue-700 mb-4">Lead Card Details</h2>

        <div className="text-sm text-gray-800 space-y-1 mb-4">
          <p><strong>Client:</strong> {lead.leadDetails?.clientName || 'N/A'}</p>
          <p><strong>Contact:</strong> {lead.leadDetails?.contact || 'N/A'}</p>
          <p><strong>Email:</strong> {lead.leadDetails?.email || 'N/A'}</p>
          <p><strong>Company:</strong> {lead.leadDetails?.companyName || 'N/A'}</p>
          <p><strong>Location:</strong> {lead.leadDetails?.location || 'N/A'}</p>
          {/* <p><strong>Status:</strong> {lead.status || 'Not Updated'}</p>
          <p><strong>Connection:</strong> {lead.connectionStatus || 'Not Connected'}</p> */}
          <p><strong>Created By:</strong> {lead.createdBy?.name || 'N/A'}</p>
        </div>

        {/* Status Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Select Status --</option>
            <option value="Hot">Hot</option>
            <option value="Warm">Warm</option>
            <option value="Cold">Cold</option>
          </select>
          <button
            onClick={handleStatusUpdate}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded"
          >
            Save Status
          </button>
        </div>

        {/* Connection Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Connection</label>
          <select
            value={selectedConnection}
            onChange={(e) => setSelectedConnection(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Select Connection --</option>
            <option value="Connected">Connected</option>
            <option value="Not Connected">Not Connected</option>
          </select>
          <button
            onClick={handleConnectionUpdate}
            className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-1.5 rounded"
          >
            Save Connection
          </button>
        </div>

       {/* Follow-Up Input */}
<div className="mb-6">
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Add Follow-Up
  </label>

  <input
    type="date"
    value={followUp.date}
    onChange={(e) => setFollowUp({ ...followUp, date: e.target.value })}
    className="w-full border px-3 py-2 rounded mb-2"
  />

  <textarea
    placeholder="Enter follow-up notes"
    rows="3"
    value={followUp.notes}
    onChange={(e) => setFollowUp({ ...followUp, notes: e.target.value })}
    className="w-full border px-3 py-2 rounded"
  />

  <button
    onClick={handleAddFollowUp}
    className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-medium transition"
  >
    Add Follow-Up
  </button>
</div>

{/* Toggle Follow-Ups */}
<div className="mb-4">
  <button
    onClick={() => setShowFollowUps(!showFollowUps)}
    className="flex items-center gap-2 text-sm text-blue-600 font-medium"
  >
    {showFollowUps ? <><FaEyeSlash /> Hide Follow-Ups</> : <><FaEye /> Show Follow-Ups</>}
  </button>
</div>

{/* Follow-Up History */}
{showFollowUps && (
  <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 rounded-xl shadow-inner">
    <h3 className="text-base font-semibold text-purple-700 mb-3 flex items-center gap-2">
      <FaStickyNote /> Follow-Up History
    </h3>

    {(lead.followUps || []).length === 0 ? (
      <p className="text-sm text-gray-500 italic">No follow-ups yet.</p>
    ) : (
      <div className="space-y-2">
        {lead.followUps.map((fup, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 text-sm bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200"
          >
            <BsCalendarEvent className="text-blue-500 mt-1" />
            <div className="flex flex-col">
              <span className="font-medium text-gray-800">{fup.date.split('T')[0]}</span>
              <span className="text-gray-600 text-xs">📝 {fup.notes}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

        {/* Forward Lead */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Forward Lead</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">-- Select User --</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleForward}
            className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white py-1.5 rounded"
          >
            Forward Lead
          </button>
        </div>
      </div>
    </div>
  );
};

export default leadDetails;
