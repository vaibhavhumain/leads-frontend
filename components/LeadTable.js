import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
        const response = await axios.get('http://localhost:5000/api/users', {
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
        'http://localhost:5000/api/leads/forward',
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

      // Make the POST request to add a follow-up
      await axios.post(
        'http://localhost:5000/api/leads/followup',
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
        `http://localhost:5000/api/leads/${leadId}/status`,
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
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full border border-gray-300 bg-white text-sm">
        <thead className="bg-gray-100 text-gray-700 text-left">
          <tr>
            <th className="p-3 border">Lead Name</th>
            <th className="p-3 border">Created By</th>
            <th className="p-3 border">Follow-Ups</th>
            <th className="p-3 border">Status</th>
            <th className="p-3 border">Forwarded To</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, idx) => (
            <tr
              key={lead._id}
              className={`border ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition`}
            >
              <td className="p-3 border">
                <div className="text-lg font-bold text-gray-800">
                  {lead.leadDetails?.name || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">
                  {lead.leadDetails?.phone || ''}
                </div>
                <div className="text-sm text-gray-600">
                  {lead.leadDetails?.company || ''}
                </div>
              </td>
              <td className="p-3 border text-gray-600">{lead.createdBy?.name || 'N/A'}</td>
              <td className="p-3 border">
                <button
                  onClick={() => toggleDropdown(lead._id)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1 rounded shadow"
                >
                  {dropdownVisible[lead._id] ? 'Hide Follow-Ups' : 'Show Follow-Ups'}
                </button>
                {dropdownVisible[lead._id] && lead.followUps?.length > 0 && (
                  <ul className="list-disc ml-5 text-xs text-gray-700 space-y-1 mt-2">
                    {lead.followUps.map((f, i) => (
                      <li key={i}>
                        <strong className="text-blue-600">{formatDateTime(f.date)}</strong>: {f.notes}
                      </li>
                    ))}
                  </ul>
                )}
                {dropdownVisible[lead._id] && lead.followUps?.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No follow-ups</p>
                )}
                <div className="mt-2 space-y-2">
                  <input
                    type="date"
                    className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-yellow-300"
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
                    className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-yellow-300"
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
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded py-1 shadow"
                  >
                    Add Follow-Up
                  </button>
                </div>
              </td>

              <td className="p-3 border">
                <div className="mb-1 text-sm font-semibold text-blue-700">
                  {lead.status || 'Not Updated'}
                </div>
                <select
                  className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-300"
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
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-2 py-1 rounded shadow"
                >
                  Update
                </button>
              </td>

              <td className="p-3 border space-y-2">
                <select
                  value={selectedUser[lead._id] || ''}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      [lead._id]: e.target.value,
                    })
                  }
                  className="border rounded px-2 py-1 w-full focus:ring-2 focus:ring-green-300"
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
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-1 rounded shadow"
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
};

export default LeadTable;
