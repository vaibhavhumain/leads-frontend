import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BASE_URL from '../utils/api';
import { FaEdit } from 'react-icons/fa';

const STATUS_OPTIONS = ['Hot', 'Warm', 'Cold'];

const LeadTable = ({ leads, setLeads, searchTerm, isAdminTable = false, isSearchActive = false }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState({});
  const [followUpInputs, setFollowUpInputs] = useState({});
  const [statusUpdates, setStatusUpdates] = useState({});
  const [dropdownVisible, setDropdownVisible] = useState({});
  const [connectionStatusUpdates, setConnectionStatusUpdates] = useState({});
  const [remarksDropdownVisible, setRemarksDropdownVisible] = useState({});
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [editingClientNameId, setEditingClientNameId] = useState(null);
  const [editedClientName, setEditedClientName] = useState('');
  const [editingEmailId, setEditingEmailId] = useState(null);
  const [editedEmail, setEditedEmail] = useState('');

  useEffect(() => {
    const fetchUsersAndSelf = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [meRes, allUsersRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/users/me`, { headers }),
          axios.get(`${BASE_URL}/api/users`, { headers }),
        ]);

        setLoggedInUser(meRes.data);
        setUsers(allUsersRes.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Failed to fetch users');
      }
    };
    fetchUsersAndSelf();
  }, []);

const filteredLeads = leads; 

  const formatDateTime = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

 
  const handleStatusUpdate = async (leadId) => {
  const token = localStorage.getItem('token');
  const status = statusUpdates[leadId];

  if (!status) {
    toast.warning('Please select a status');
    return;
  }

  try {
    const toastId = toast.loading('Updating lead status...');

    await axios.put(
      `${BASE_URL}/api/leads/${leadId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.update(toastId, {
      render: 'Status updated successfully ✅',
      type: 'success',
      isLoading: false,
      autoClose: 3000,
    });

    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead._id === leadId ? { ...lead, status } : lead
      )
    );

    setStatusUpdates((prev) => ({
      ...prev,
      [leadId]: '',
    }));
  } catch (err) {
    console.error('Error updating status:', err);
    toast.error('Failed to update status');
  }
};

const handleConnectionStatusUpdate = async (leadId) => {
  const token = localStorage.getItem('token');
  const connectionStatus = connectionStatusUpdates[leadId];

  if (!connectionStatus) {
    toast.warning('Please select a connection status');
    return;
  }

  try {
    const toastId = toast.loading('Updating connection status...');

    await axios.put(
      `${BASE_URL}/api/leads/${leadId}/connection-status`,
      { connectionStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.update(toastId, {
      render: 'Connection status updated ✅',
      type: 'success',
      isLoading: false,
      autoClose: 3000,
    });

    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead._id === leadId ? { ...lead, connectionStatus } : lead
      )
    );

    setConnectionStatusUpdates((prev) => ({
      ...prev,
      [leadId]: '',
    }));
  } catch (err) {
    console.error('Error updating connection status:', err);
    toast.error('Failed to update connection status');
  }
};

const updateEmail = async (leadId) => {
  const token = localStorage.getItem('token');
  if (!editedEmail.trim()) {
    toast.warning('Email cannot be empty');
    return;
  }

  try {
    const response = await axios.put(
      `${BASE_URL}/api/leads/${leadId}/email`,
      { email: editedEmail },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success('Email updated ✅');
    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId
          ? {
              ...lead,
              leadDetails: {
                ...lead.leadDetails,
                email: editedEmail,
              },
            }
          : lead
      )
    );
    setEditingEmailId(null);
    setEditedEmail('');
  } catch (err) {
    console.error('Failed to update email', err);
    toast.error('Update failed');
  }
};


const updateClientName = async (leadId) => {
  const token = localStorage.getItem('token');
  if (!editedClientName.trim()) {
    toast.warning('Client name cannot be empty');
    return;
  }

  try {
    const response = await axios.put(
      `${BASE_URL}/api/leads/${leadId}/client-name`,
      { clientName: editedClientName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success('Client name updated ✅');
    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId
          ? {
              ...lead,
              leadDetails: {
                ...lead.leadDetails,
                clientName: editedClientName,
              },
            }
          : lead
      )
    );
    setEditingClientNameId(null);
    setEditedClientName('');
  } catch (err) {
    console.error('Failed to update client name', err);
    toast.error('Update failed');
  }
};


  const toggleDropdown = (leadId) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [leadId]: !prev[leadId],
    }));
  };
  const toggleRemarksDropdown = (leadId) => {
  setRemarksDropdownVisible((prev) => ({
    ...prev,
    [leadId]: !prev[leadId],
  }));
};
const handleForwardLead = async (leadId) => {
  const token = localStorage.getItem('token');
  const userId = selectedUser[leadId];

  if (!userId) {
    toast.warning('Please select a user to forward');
    return;
  }

  try {
    const toastId = toast.loading('Forwarding lead...');

    const response = await axios.post(
      `${BASE_URL}/api/leads/forward`,
      { leadId, userId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const updatedLead = response.data.lead; 

    toast.update(toastId, {
      render: 'Lead forwarded successfully ✅',
      type: 'success',
      isLoading: false,
      autoClose: 3000,
    });

    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead._id === leadId ? updatedLead : lead
      )
    );

    setSelectedUser((prev) => ({
      ...prev,
      [leadId]: '',
    }));
  } catch (err) {
    console.error('Error forwarding lead:', err);
    toast.error('Failed to forward lead');
  }
};

const handleFollowUp = async (leadId) => {
  const token = localStorage.getItem('token');
  const input = followUpInputs[leadId];

  if (!input?.date || !input?.notes) {
    toast.warning('Please enter both date and notes');
    return;
  }

  try {
    const toastId = toast.loading('Adding follow-up...');

    const response = await axios.post(
      `${BASE_URL}/api/leads/followup`,
      {
        leadId,
        followUp: {
          date: input.date,
          notes: input.notes,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.update(toastId, {
      render: 'Follow-up added ✅',
      type: 'success',
      isLoading: false,
      autoClose: 3000,
    });

    const updatedLead = response.data.lead;

    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead._id === leadId
          ? { ...lead, followUps: response.data.lead.followUps }
          : lead
      )
    );

    setFollowUpInputs((prev) => ({
      ...prev,
      [leadId]: { date: '', notes: '' },
    }));
  } catch (err) {
    console.error('Error adding follow-up:', err);
    toast.error('Failed to add follow-up');
  }
};


const handleDeleteLead = async (leadId) => {
  const confirm = window.confirm('Are you sure you want to delete this lead?');
  if (!confirm) return;

  try {
    const token = localStorage.getItem('token');

    await axios.delete(`${BASE_URL}/api/leads/${leadId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success('Lead deleted successfully');

    // Remove lead from state
    setLeads((prevLeads) => prevLeads.filter((lead) => lead._id !== leadId));
  } catch (error) {
    console.error('Error deleting lead:', error);
    toast.error('Failed to delete lead');
  }
};

const handleDeleteAllLeads = async () => {
  const confirm = window.confirm('⚠️ Are you sure you want to delete ALL leads? This cannot be undone.');
  if (!confirm) return;

  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${BASE_URL}/api/leads`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success('All leads deleted successfully');
    setLeads([]); 
  } catch (error) {
    console.error('Error deleting all leads:', error);
    toast.error('Failed to delete all leads');
  }
};


  const generateWhatsAppLink = (lead) => {
  const message = `*Lead Details*\n
Name: ${lead.leadDetails?.name || 'N/A'}
Phone: ${lead.leadDetails?.phone || 'N/A'}
Company: ${lead.leadDetails?.company || 'N/A'}
Status: ${lead.status || 'Not Updated'}
Created By: ${lead.createdBy?.name || 'N/A'}
Follow-Ups:\n${(lead.followUps || []).map(f => `- ${formatDateTime(f.date)}: ${f.notes}`).join('\n')}`;

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
};


const formatTime = (seconds) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};


if (!loggedInUser) return null;


  return (
  <div className="w-full px-4 py-6 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 min-h-screen">
    {isAdminTable && (
      <div className="flex justify-end mb-6">
        <button
          onClick={handleDeleteAllLeads}
          className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-5 py-2 rounded-md text-sm font-semibold shadow-lg"
        >
          Delete All Leads
        </button>
      </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredLeads.map((lead, idx) => {
        const isFrozenByCreator =
          lead.createdBy?._id === loggedInUser?._id &&
          lead.forwardedTo?.user?._id &&
          lead.isFrozen;

        return (
          <div
            key={lead._id}
            className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 flex flex-col justify-between hover:shadow-2xl transition duration-300"
            style={{ backgroundImage: 'linear-gradient(to right top, #ffffff, #f2f6ff, #e2eeff, #cde6ff, #b3dfff)' }}
          >
            <div className="text-xs text-gray-600 mb-2 font-semibold">#{idx + 1} • Created by: <span className="text-purple-700">{lead.createdBy?.name || 'N/A'}</span></div>
            <div className="text-lg font-bold text-blue-900 mb-1">{lead.leadDetails?.clientName || 'N/A'}</div>
            <div className="text-sm text-gray-700 mb-3 italic">{lead.leadDetails?.companyName || 'No Company'}</div>

            <div className="text-xs text-gray-600 mb-2">
              📞 <span className="text-blue-700 font-semibold">{lead.leadDetails?.contact || 'N/A'}</span><br />
              📍 {lead.leadDetails?.location || 'N/A'}
            </div>

            <div className="text-xs text-gray-600 mb-3">
              ✉️ <span className="text-blue-700 font-semibold">{lead.leadDetails?.email || 'N/A'}</span>
            </div>

            <div className="text-sm font-medium text-gray-800 mb-2">
              Status: <span className={`font-bold ${lead.status === 'Hot' ? 'text-red-500' : lead.status === 'Warm' ? 'text-yellow-500' : 'text-green-600'}`}>{lead.status || 'Not Updated'}</span>
            </div>

            <div className="flex flex-col gap-2 mb-2">
              <select
                className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none bg-blue-50"
                value={statusUpdates[lead._id] || ''}
                onChange={(e) => setStatusUpdates({ ...statusUpdates, [lead._id]: e.target.value })}
                disabled={isFrozenByCreator}
              >
                <option value="">Update Status</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <button
                onClick={() => handleStatusUpdate(lead._id)}
                className={`text-xs py-1 rounded bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold transition ${isFrozenByCreator ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isFrozenByCreator}
              >
                Update Status
              </button>
            </div>

            <div className="text-sm font-medium text-gray-800 mb-2">Connection: <span className={lead.connectionStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}>{lead.connectionStatus}</span></div>

            <div className="flex flex-col gap-2 mb-2">
              <select
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-purple-50"
                value={connectionStatusUpdates[lead._id] || ''}
                onChange={(e) => setConnectionStatusUpdates({ ...connectionStatusUpdates, [lead._id]: e.target.value })}
                disabled={isFrozenByCreator}
              >
                <option value="">Update Connection</option>
                <option value="Connected">Connected</option>
                <option value="Not Connected">Not Connected</option>
              </select>
              <button
                onClick={() => handleConnectionStatusUpdate(lead._id)}
                className={`text-xs py-1 rounded bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold transition ${isFrozenByCreator ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isFrozenByCreator}
              >
                Update Connection
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <select
                className="text-xs border border-gray-300 rounded px-2 py-1 bg-green-50"
                value={selectedUser[lead._id] || ''}
                onChange={(e) => setSelectedUser({ ...selectedUser, [lead._id]: e.target.value })}
                disabled={isFrozenByCreator}
              >
                <option value="">Forward to</option>
                {users.filter((u) => u._id !== loggedInUser._id).map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
              <button
                onClick={() => handleForwardLead(lead._id)}
                className={`text-xs py-1 rounded bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold transition ${isFrozenByCreator ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isFrozenByCreator}
              >
                Forward Lead
              </button>
              <a
                href={generateWhatsAppLink(lead)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs py-1 rounded bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold text-center"
              >
                WhatsApp Lead
              </a>
            </div>

            <div className="mt-4">
              <button
                onClick={() => toggleRemarksDropdown(lead._id)}
                className="w-full text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 py-1 rounded"
              >
                {remarksDropdownVisible[lead._id] ? 'Hide Remarks' : 'Show Remarks'}
              </button>
              {remarksDropdownVisible[lead._id] && (
                <div className="mt-2 text-xs text-gray-800 max-h-36 overflow-y-auto space-y-1">
                  {lead.remarksHistory?.map((r, i) => (
                    <div key={i} className="border-b border-gray-300 pb-1">
                      <span className="font-semibold text-blue-600">{formatDateTime(r.date)}</span>: {r.remarks}
                      <div className="text-[10px] text-gray-500 italic">— by {r.updatedBy?.name}</div>
                    </div>
                  )) || <div className="text-gray-400">No remarks yet.</div>}
                </div>
              )}
            </div>

            {isAdminTable && (
              <div className="mt-4">
                <button
                  onClick={() => handleDeleteLead(lead._id)}
                  className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-1 text-xs font-semibold rounded shadow"
                >
                  Delete Lead
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

}   
export default LeadTable;