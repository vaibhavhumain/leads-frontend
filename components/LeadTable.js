import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BASE_URL from '../utils/api';
const STATUS_OPTIONS = ['New', 'In Progress', 'Followed Up', 'Converted', 'Not Interested'];

const LeadTable = ({ leads, setLeads }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState({});
  const [followUpInputs, setFollowUpInputs] = useState({});
  const [statusUpdates, setStatusUpdates] = useState({});
  const [dropdownVisible, setDropdownVisible] = useState({});

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
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
      hour: '2-digit',
      minute: '2-digit',
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
      await axios.post(
        `${BASE_URL}/api/leads/forward`,
        { leadId, userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Lead forwarded successfully');
    } catch (err) {
      console.error('Error forwarding lead:', err);
      setError('Error forwarding lead');
      toast.error('Failed to forward lead');
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

      // Update the leads state with the new follow-up
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
    } catch (err) {
      console.error('Error adding follow-up:', err.response ? err.response.data : err.message);
      setError('Error adding follow-up');
      toast.error(err.response ? err.response.data.message : 'Failed to add follow-up');
    }
  };

  // Update status of a lead
  const handleStatusUpdate = async (leadId) => {
    const status = statusUpdates[leadId];
    if (!status) {
      toast.error('Please select a status');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BASE_URL}/api/leads/${leadId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );


      const updatedLead = response.data.lead;

      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead._id === leadId ? { ...lead, status: updatedLead.status } : lead
        )
      );

      setStatusUpdates((prev) => ({ ...prev, [leadId]: '' }));

      toast.success('Lead status updated successfully');
    } catch (err) {
      console.error('Status update error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error updating status');
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const toggleDropdown = (leadId) => {
    setDropdownVisible((prev) => ({
      ...prev,
      [leadId]: !prev[leadId],
    }));
  };

  return (
  <div className="w-full overflow-x-auto rounded-xl shadow-lg bg-white max-w-full sm:px-2">
    <table className="min-w-full text-sm border-separate border-spacing-y-2 table-auto">
      <thead className="bg-gray-200 text-gray-800 text-left">
        <tr>
          <th className="p-3 sm:p-4">Lead Name</th>
          <th className="p-3 sm:p-4">Phone</th>
          <th className="p-3 sm:p-4">Created By</th>
          <th className="p-3 sm:p-4">Follow-Ups</th>
          <th className="p-3 sm:p-4">Status</th>
          <th className="p-3 sm:p-4">Forwarded To</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead, idx) => (
          <tr
            key={lead._id}
            className={`rounded-xl ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:shadow transition`}
          >
            {/* Lead Name */}
            <td className="p-3 sm:p-4 align-top break-words">
              <div className="font-semibold text-base text-gray-900">
                {lead.leadDetails?.name || 'N/A'}
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

            {/* Follow-Ups */}
            <td className="p-3 sm:p-4">
              <button
                onClick={() => toggleDropdown(lead._id)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-md text-xs font-semibold"
              >
                {dropdownVisible[lead._id] ? 'Hide Follow-Ups' : 'Show Follow-Ups'}
              </button>

              {dropdownVisible[lead._id] && (
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
                className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-2 py-1 rounded-md text-xs font-semibold"
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
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleForwardLead(lead._id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-1 rounded-md text-xs font-semibold"
              >
                Forward
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}
export default LeadTable;
