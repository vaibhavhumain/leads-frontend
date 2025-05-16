import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BASE_URL from '../utils/api';
const STATUS_OPTIONS = ['Hot','Warm','Cold'];

const LeadTable = ({ leads, setLeads }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState({});
  const [followUpInputs, setFollowUpInputs] = useState({});
  const [statusUpdates, setStatusUpdates] = useState({});
  const [dropdownVisible, setDropdownVisible] = useState({});
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [connectionStatusUpdates, setConnectionStatusUpdates] = useState({});
  const [remarksDropdownVisible, setRemarksDropdownVisible] = useState({});



  // Fetch users
 useEffect(() => {
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');

      // Get logged-in user
      const meRes = await axios.get(`${BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoggedInUser(meRes.data);

      // Get all users
      const allUsersRes = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(allUsersRes.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error fetching users');
      toast.error('Failed to fetch users');
    }
  };

  fetchUsers();
}, []);


  // Format date to a readable format
  const formatDateTime = (isoString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(isoString).toLocaleString('en-US', options);
  };

  // Forward lead to selected user
  const handleForwardLead = async (leadId) => {
  const userId = selectedUser[leadId];

  if (!userId) {
    toast.error('Please select a user to forward the lead');
    return;
  }

  try {
    const token = localStorage.getItem('token');

    const response = await axios.post(
      `${BASE_URL}/api/leads/forward`,
      { leadId, userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success('Lead forwarded successfully!');
    console.log('✅ Forward lead response:', response.data);

    setSelectedUser((prev) => ({
      ...prev,
      [leadId]: '',
    }));

  } catch (err) {
    console.error('❌ Error forwarding lead:', {
      message: err.message,
      response: err.response?.data,
    });
    setError('Error forwarding lead');
    toast.error(err.response?.data?.message || 'Failed to forward lead');
  }
};


  // Add a follow-up note and date for a lead
  const handleFollowUp = async (leadId) => {
  const { date, notes } = followUpInputs[leadId] || {};

  if (!date || !notes) {
    toast.error('Please enter both date and notes');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to add a follow-up');
      return;
    }

    const formattedDate = new Date(date).toISOString();

    await axios.post(
      `${BASE_URL}/api/leads/followup`,
      { leadId, followUp: { date: formattedDate, notes } },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success('Follow-up added successfully');

    // ✅ Update leads state
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead._id === leadId
          ? {
              ...lead,
              followUps: [...lead.followUps, { date: formattedDate, notes }],
            }
          : lead
      )
    );

    // ✅ Clear input values
    setFollowUpInputs((prevInputs) => ({
      ...prevInputs,
      [leadId]: { date: '', notes: '' },
    }));
  } catch (err) {
    console.error('Error adding follow-up:', err.response ? err.response.data : err.message);
    setError('Error adding follow-up');
    toast.error(err.response ? err.response.data.message : 'Failed to add follow-up');
  }
};

  // Update status of a lead
  const handleStatusUpdate = async (leadId) => {
  const token = localStorage.getItem('token');
  const status = statusUpdates[leadId] || '';

  if (!status) {
    toast.warning('Please select a status');
    return;
  }

  try {
    const toastId = toast.loading('Updating lead...');

    await axios.put(
      `${BASE_URL}/api/leads/${leadId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.update(toastId, {
      render: 'Lead updated successfully ✅',
      type: 'success',
      isLoading: false,
      autoClose: 3000,
    });

    // ✅ Update local lead list
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead._id === leadId ? { ...lead, status } : lead
      )
    );

    // ✅ Clear the select field for that lead
    setStatusUpdates((prev) => ({
      ...prev,
      [leadId]: '',
    }));
  } catch (err) {
    console.error('Error updating lead:', err);
    toast.error('Failed to update lead');
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


  return (
  <div className="w-full overflow-x-auto rounded-xl shadow-lg bg-white max-w-full sm:px-2">
    <table className="min-w-full text-sm border-separate border-spacing-y-2 table-auto">
      <thead className="bg-gray-200 text-gray-800 text-left">
        <tr>
          <th className="p-3 sm:p-4">Lead Name</th>
          <th className="p-3 sm:p-4">Phone</th>
          <th className="p-3 sm:p-4">Created By</th>
          <th className="p-3 sm:p-4">Status</th>
          <th className="p-3 sm:p-4">Follow-Ups</th>
          <th className="p-3 sm:p-4">Lead Status</th>
          <th className="p-3 sm:p-4">Forwarded To</th>
          <th className="p-3 sm:p-4">Next Action Plan</th>
        </tr>
      </thead>
      <tbody>
  {leads.map((lead, idx) => {
    const isFrozenByCreator =
  lead.createdBy?._id === loggedInUser?._id &&
  lead.forwardedTo?.user?._id &&
  lead.isFrozen;

    return (
      <tr
        key={lead._id}
        className={`rounded-xl ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:shadow transition`}
      >
        {/* Lead Name */}
        <td className="p-3 sm:p-4 align-top break-words">
          <div className="font-semibold text-base text-gray-900">
            {lead.leadDetails?.name || 'N/A'}
            {isFrozenByCreator && (
              <span className="text-xs font-semibold text-red-600 ml-2">🔒 Forwarded</span>
            )}
          </div>
          <div className="text-sm text-gray-600">{lead.leadDetails?.company || ''}</div>
        </td>

        {/* Phone */}
        <td className="p-3 sm:p-4 align-top text-gray-800 break-words whitespace-normal">
          {lead.leadDetails?.phone || 'N/A'}
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


      </tr>
      
    );
  })}
</tbody>
    </table>
  </div>
);
}
export default LeadTable;
