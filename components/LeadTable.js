import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import BASE_URL from '../utils/api';
import { FaPlay, FaPause, FaStop } from 'react-icons/fa';

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
  const [uploadedLeads, setUploadedLeads] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const fileInputRef = useRef(null);
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

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const mappedLeads = jsonData.map((row) => {
  // Normalize column keys
  const keys = Object.keys(row).reduce((acc, key) => {
    acc[key.trim().toLowerCase()] = row[key];
    return acc;
  }, {});

  return {
    leadDetails: {
      companyName: keys['company name'] || '',
      contact: keys['phone'] || '',
      location: keys['location'] || '',
      clientName: 'N/A',
      source: 'Excel Upload',
    },
    status: 'Cold',
    connectionStatus: 'Not Connected',
    createdBy: loggedInUser,
    followUps: [],
    forwardedTo: {},
    isFrozen: false,
    remarksHistory: [],
  };
});


      setUploadedLeads(mappedLeads);
      toast.success('File uploaded. Click the import button to continue.');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkUpload = async () => {
    if (!uploadedLeads.length) {
      toast.error('Please upload an Excel sheet first.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/leads/bulk`,
        { leads: uploadedLeads },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`${response.data.leads.length} leads uploaded successfully.`);
      setLeads((prev) => [...prev, ...response.data.leads]);
      setUploadedLeads([]);
    } catch (error) {
      console.error('Error uploading leads:', error);
      toast.error('Failed to upload leads');
    }
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
  <div className="w-full overflow-x-auto rounded-xl shadow-lg bg-white max-w-full sm:px-2">
    {isAdminTable && (
  <div className="flex justify-end mt-4 px-4">
    <button
      onClick={handleDeleteAllLeads}
      className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-md text-sm font-semibold"
    >
      Delete All Leads
    </button>
  </div>
)}
{!isAdminTable && (
  <div className="p-4 border-b bg-white">
    <div className="flex gap-3 items-center flex-wrap">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleExcelUpload}
        className="border rounded px-3 py-1 text-sm"
      />

      <button
        onClick={async () => {
          if (!uploadedLeads.length) {
            toast.error('Please upload an Excel sheet first.');
            return;
          }

          setLeads((prev) => [...prev, ...uploadedLeads]);

          try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
              `${BASE_URL}/api/leads/bulk`,
              { leads: uploadedLeads },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            toast.success(`${response.data.leads.length} leads imported and saved to DB.`);

            setUploadedLeads((prev) => {
            });
          } catch (error) {
            console.error('Error uploading leads:', error);
            toast.error('Failed to save leads to DB');
          }
        }}
        className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded text-sm font-semibold"
      >
        Import & Save Leads
      </button>
    </div>
  </div>
)}


    <table className="min-w-full text-sm border-separate border-spacing-y-2 table-auto">
  <thead className="bg-gray-200 text-gray-800 text-left">
    <tr>
      <th className="p-3 sm:p-4 text-left">Sr. No</th>
      <th className="p-3 sm:p-4 text-left">Client Name</th>
      <th className="p-3 sm:p-4 text-left">Contact</th>
      <th className="p-3 sm:p-4 text-left">Company Name</th>
      <th className="p-3 sm:p-4 text-left">Email</th>
      <th className="p-3 sm:p-4 text-left">Location</th>
      <th className="p-3 sm:p-4 text-left">Created By</th>
      <th className="p-3 sm:p-4 text-left">Connection Status</th>
      <th className="p-3 sm:p-4 text-left">Follow-Ups</th>
      <th className="p-3 sm:p-4 text-left">Lead Status</th>
      <th className="p-3 sm:p-4 text-left">Forwarded To</th>
      <th className="p-3 sm:p-4 text-left">Next Action Plan</th>
      {isAdminTable && <th className="p-3 sm:p-4 text-left">Actions</th>}
    </tr>
  </thead>

      <tbody>
 {filteredLeads.map((lead, idx) => {
    const isFrozenByCreator =
  lead.createdBy?._id === loggedInUser?._id &&
  lead.forwardedTo?.user?._id &&
  lead.isFrozen;

    return (
      <tr
        key={lead._id}
        className={`rounded-xl ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:shadow transition`}
      >
          {/* Sr. No */}
       <td className="p-3 sm:p-4 align-top text-gray-700">{idx + 1}</td>
{/* Client Name */}
<td className="p-3 sm:p-4 align-top text-gray-800 break-words whitespace-normal">
  {editingClientNameId === lead._id ? (
    <div className="flex items-center gap-2">
      <input
        type="text"
        className="border px-2 py-1 rounded text-xs w-full"
        value={editedClientName}
        onChange={(e) => setEditedClientName(e.target.value)}
      />
      <button
  onClick={() => updateClientName(lead._id)}
        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
      >
        Save
      </button>
      <button
        onClick={() => {
          setEditingClientNameId(null);
          setEditedClientName('');
        }}
        className="bg-gray-400 hover:bg-gray-500 text-white text-xs px-2 py-1 rounded"
      >
        Cancel
      </button>
    </div>
  ) : (
    <div className="flex items-center justify-between gap-2">
      <span>{lead.leadDetails?.clientName || 'N/A'}</span>
      <button
        onClick={() => {
          setEditingClientNameId(lead._id);
          setEditedClientName(lead.leadDetails?.clientName || '');
        }}
        className="text-blue-600 text-xs underline"
      >
        Edit
      </button>
    </div>
  )}
</td>

{/* Contact */}
<td className="p-3 sm:p-4 align-top text-gray-800 break-words whitespace-normal">
  {lead.leadDetails?.contact || 'N/A'}
</td>

{/* Company Name */}
<td className="p-3 sm:p-4 align-top text-gray-800 break-words whitespace-normal">
  {lead.leadDetails?.companyName || 'N/A'}
</td>

{/* Email */}
<td className="p-3 sm:p-4 align-top text-gray-800 break-words whitespace-normal">
  {editingEmailId === lead._id ? (
    <div className="flex items-center gap-2">
      <input
        type="text"
        className="border px-2 py-1 rounded text-xs w-full"
        value={editedEmail}
        onChange={(e) => setEditedEmail(e.target.value)}
      />
      <button
        onClick={() => updateEmail(lead._id)}
        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
      >
        Save
      </button>
      <button
        onClick={() => {
          setEditingEmailId(null);
          setEditedEmail('');
        }}
        className="bg-gray-400 hover:bg-gray-500 text-white text-xs px-2 py-1 rounded"
      >
        Cancel
      </button>
    </div>
  ) : (
    <div className="flex items-center justify-between gap-2">
      <span>{lead.leadDetails?.email || 'N/A'}</span>
      <button
        onClick={() => {
          setEditingEmailId(lead._id);
          setEditedEmail(lead.leadDetails?.email || '');
        }}
        className="text-blue-600 text-xs underline"
      >
        Edit
      </button>
    </div>
  )}
</td>

{/* Location */}
<td className="p-3 sm:p-4 align-top text-gray-800 break-words whitespace-normal">
  {lead.leadDetails?.location || 'N/A'}
</td>


        {/* Created By */}
        <td className="p-3 sm:p-4 align-top text-gray-700 break-words">
          {lead.createdBy?.name || 'N/A'}
        </td>
        {/* Connection Status */}
<td className="p-3 sm:p-4 align-top">
  {/* Show current or updated connection status */}
  <div className="text-sm font-semibold mb-1">
    <span className={`
      ${lead.connectionStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}
    `}>
      {lead.connectionStatus || 'Not Connected'}
    </span>
  </div>

  {/* Dropdown to change connection status */}
  <select
    className="w-full text-xs border px-2 py-1 rounded"
    value={connectionStatusUpdates[lead._id] || ''}
    onChange={(e) =>
      setConnectionStatusUpdates((prev) => ({
        ...prev,
        [lead._id]: e.target.value,
      }))
    }
    disabled={isFrozenByCreator}
  >
    <option value="">Update Connection</option>
    <option value="Connected">Connected</option>
    <option value="Not Connected">Not Connected</option>
  </select>

  <button
    onClick={() => handleConnectionStatusUpdate(lead._id)}
    disabled={isFrozenByCreator}
    className={`w-full mt-1 py-1 rounded-md text-xs font-semibold text-white ${
      isFrozenByCreator
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-purple-600 hover:bg-purple-700'
    }`}
  >
    Update
  </button>
</td>


        {/* Follow-Ups */}
        <td className="p-3 sm:p-4">
          <button
            onClick={() => toggleDropdown(lead._id)}
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-md text-xs font-semibold ${
              isFrozenByCreator ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isFrozenByCreator}
          >
            {dropdownVisible[lead._id] ? 'Hide Follow-Ups' : 'Show Follow-Ups'}
          </button>

          {dropdownVisible[lead._id] && !isFrozenByCreator && (
            <div className="mt-2 space-y-2">
              {lead.followUps?.length > 0 ? (
                <ul className="text-xs text-gray-700 space-y-1">
                  {lead.followUps.map((f, i) => (
                    <li key={i}>
                      <span className="font-medium text-blue-600">{formatDateTime(f.date)}</span>: {f.notes}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">No follow-ups</p>
              )}

              <input
                type="date"
                className="w-full border px-2 py-1 rounded text-xs"
                value={followUpInputs[lead._id]?.date || ''}
                onChange={(e) =>
                  setFollowUpInputs({
                    ...followUpInputs,
                    [lead._id]: {
                      ...followUpInputs[lead._id],
                      date: e.target.value,
                    },
                  })
                }
              />
              <textarea
                rows={2}
                placeholder="Follow-up notes"
                className="w-full border px-2 py-1 rounded text-xs"
                value={followUpInputs[lead._id]?.notes || ''}
                onChange={(e) =>
                  setFollowUpInputs({
                    ...followUpInputs,
                    [lead._id]: {
                      ...followUpInputs[lead._id],
                      notes: e.target.value,
                    },
                  })
                }
              />
              <button
                onClick={() => handleFollowUp(lead._id)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-md py-1 text-xs font-semibold"
              >
                Add Follow-Up
              </button>
            </div>
          )}
        </td>

        {/* Status */}
        <td className="p-3 sm:p-4">
          <div className="text-sm font-semibold text-blue-700 mb-1">
            {lead.status || 'Not Updated'}
          </div>
          <select
            className="w-full text-xs border px-2 py-1 rounded"
            value={statusUpdates[lead._id] || ''}
            onChange={(e) =>
              setStatusUpdates({ ...statusUpdates, [lead._id]: e.target.value })
            }
            disabled={isFrozenByCreator}
          >
            <option value="">Update Status</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleStatusUpdate(lead._id)}
            disabled={isFrozenByCreator}
            className={`w-full mt-2 py-1 rounded-md text-xs font-semibold text-white ${
              isFrozenByCreator
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Update
          </button>
        </td>

        {/* Forwarded To */}
        <td className="p-3 sm:p-4 space-y-2">
          <select
            className="w-full text-xs border px-2 py-1 rounded"
            value={selectedUser[lead._id] || ''}
            onChange={(e) =>
              setSelectedUser({
                ...selectedUser,
                [lead._id]: e.target.value,
              })
            }
            disabled={isFrozenByCreator}
          >
            <option value="">Select user</option>
            {users
              .filter((user) => loggedInUser && String(user._id) !== String(loggedInUser._id))
              .map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.role})
                </option>
              ))}
          </select>

          <button
            onClick={() => handleForwardLead(lead._id)}
            disabled={isFrozenByCreator}
            className={`w-full py-1 rounded-md text-xs font-semibold text-white ${
              isFrozenByCreator
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Forward
          </button>
          <a
  href={generateWhatsAppLink(lead)}
  target="_blank"
  rel="noopener noreferrer"
>
  <button
    className="w-full bg-green-500 hover:bg-green-600 text-white py-1 text-xs font-semibold rounded-md mt-1"
  >
    WhatsApp Lead
  </button>
</a>

        </td>
        {/* Next Action Plan - Full Remark History */}
<td className="p-3 sm:p-4 align-top text-xs text-gray-800 whitespace-pre-line">
  <button
    onClick={() => toggleRemarksDropdown(lead._id)}
    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-1 rounded-md text-xs font-semibold"
  >
    {remarksDropdownVisible[lead._id] ? 'Hide Remarks' : 'Show Remarks'}
  </button>

  {remarksDropdownVisible[lead._id] && (
    <div className="mt-2">
      {lead.remarksHistory && lead.remarksHistory.length > 0 ? (
        <ul className="space-y-1">
          {lead.remarksHistory.map((r, index) => (
            <li key={index} className="border-b pb-1">
              <div>
                <span className="text-blue-600 font-medium">
                  {formatDateTime(r.date)}:
                </span>{' '}
                {r.remarks}
              </div>
              <div className="mt-1 text-[11px] text-gray-500 italic">
                — Updated by: {r.updatedBy?.name || 'Unknown'}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mt-2">No remarks yet</p>
      )}
    </div>
  )}
</td>

<td className="p-3 sm:p-4 align-top">
  {isAdminTable && (
    <button
      onClick={() => handleDeleteLead(lead._id)}
      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-semibold"
    >
      Delete
    </button>
  )}
</td>

      </tr>
      
      
    );
  })}
</tbody>
    </table>
  </div>
);
}
export default LeadTable;
