import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BASE_URL from '../utils/api';
import { FaEdit } from 'react-icons/fa';
import { useRouter } from 'next/router';
const STATUS_OPTIONS = ['Hot', 'Warm', 'Cold'];

const LeadTable = ({ leads, setLeads, searchTerm, isAdminTable = false, isSearchActive = false }) => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('')
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
  const [currentPage, setCurrentPage] = useState(0);
  const [currentLeadIndex , setCurrentLeadIndex] = useState(0); 
  const [actionPlan, setActionPlan] = useState('');
  const [savedActionPlansMap, setSavedActionPlansMap] = useState({});
  const [showActionPlans, setShowActionPlans] = useState(false);
  const router = useRouter();
  const navigate = useRouter().push;
  const token = localStorage.getItem('token');
  const [leadId, setLeadId] = useState(null);

  const leadsPerPage = 3;

  
const handleViewDetails = (lead) => {
  navigate(`/lead-details/${lead._id}`);
};


    const handleSave = () => {
    updateClientName(editingClientNameId);
};

const handleEmailSave = () => {
  updateEmail(editingEmailId);
};


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


const handleSaveActionPlan = async () => {
  const currentLead = filteredLeads[currentLeadIndex];
  if (!currentLead?._id) {
    toast.error('Lead ID not found.');
    return;
  }

  if (!actionPlan.trim()) {
    toast.error('Action Plan / Remarks cannot be empty.');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/leads/saveActionPlan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ leadId: currentLead._id, actionPlan }),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      toast.error('Response is not valid JSON');
      return;
    }

    if (res.ok) {
      setSavedActionPlansMap((prev) => ({
        ...prev,
        [currentLead._id]: data.actionPlans.map(plan => plan.text),
      }));
      setActionPlan('');
      toast.success('Action plan saved!');
    } else {
      toast.error(data.message || 'Failed to save');
    }
  } catch (err) {
    console.error(err);
    toast.error('Something went wrong.');
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

const paginatedLeads = filteredLeads.slice(
  currentPage * leadsPerPage,
  currentPage * leadsPerPage + leadsPerPage
);

const hasNextPage = (currentPage + 1) * leadsPerPage < filteredLeads.length;
const hasPreviousLead = currentLeadIndex > 0;
const hasNextLead = currentLeadIndex < filteredLeads.length - 1;

const goToPreviousLead = () => {
  if (hasPreviousLead) setCurrentLeadIndex((prev) => prev - 1);
};

const goToNextLead = () => {
  if (hasNextLead) setCurrentLeadIndex((prev) => prev + 1);
};


// Sends just a text message on WhatsApp
const handleWhatsAppMessage = (contact, clientName = '') => {
  if (!contact || typeof contact !== 'string') {
    alert("Contact is invalid or missing");
    return;
  }
  const cleanedContact = contact.replace(/\D/g, '');
  const isValidContact = /^\d{10}$/.test(cleanedContact);
  if (!isValidContact) {
    alert("Please enter a valid 10-digit contact number.");
    return;
  }

  const message = encodeURIComponent(
    `Dear ${clientName || 'Customer'}, It was a pleasure speaking with you today! Thank you for considering Gobind Coach Builders for your bus body requirements. We’re excited about the opportunity to bring your vision to life with our durable designs and unmatched craftsmanship.`
  );

  const url = `https://api.whatsapp.com/send?phone=91${cleanedContact}&text=${message}`;
  window.open(url, '_blank');
};


// Sends a message on WhatsApp including a PDF link
const handleWhatsAppPdfShare = (contact, clientName = '', pdfFileName) => {
  if (!contact || typeof contact !== 'string') {
    alert("Contact is invalid or missing");
    return;
  }
  const cleanedContact = contact.replace(/\D/g, '');
  const isValidContact = /^\d{10}$/.test(cleanedContact);
  if (!isValidContact) {
    alert("Please enter a valid 10-digit contact number.");
    return;
  }

  const origin = window.location.origin;
  const pdfUrl = `${origin}/${pdfFileName}`;

  const message = encodeURIComponent(
    `Dear ${clientName || 'Customer'},\n\nPlease find the PDF here:\n${pdfUrl}`
  );

  const url = `https://api.whatsapp.com/send?phone=91${cleanedContact}&text=${message}`;
  window.open(url, '_blank');
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

    <div className="flex justify-center">
  {filteredLeads.length > 0 && (
    (() => {
      const lead = filteredLeads[currentLeadIndex];
      const isFrozenByCreator =
        lead.createdBy?._id === loggedInUser?._id &&
        lead.forwardedTo?.user?._id &&
        lead.isFrozen;

      return (
        <div
          key={lead._id}
          className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg hover:shadow-2xl transition duration-300"
          style={{
            backgroundImage:
              'linear-gradient(to right top, #ffffff, #f2f6ff, #e2eeff, #cde6ff, #b3dfff)',
          }}
        >
          <div className="text-xs text-gray-600 mb-2 font-semibold">
            #{currentLeadIndex + 1} • Created by:{' '}
            <span className="text-purple-700">
              {lead.createdBy?.name || 'N/A'}
            </span>
          </div>

          {/* Client Name */}
          <div>
            {editingClientNameId === lead._id ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editedClientName}
                  onChange={(e) => setEditedClientName(e.target.value)}
                  className="border p-1 rounded w-full"
                />
                <button
                  onClick={handleSave}
                  className="text-green-600 font-medium hover:underline"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingClientNameId(null)}
                  className="text-red-500 font-medium hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <span>{lead.leadDetails?.clientName || 'No Name'}</span>
                <FaEdit
                  className="inline-block ml-2 text-gray-500 cursor-pointer hover:text-blue-600"
                  onClick={() => {
                    setEditingClientNameId(lead._id);
                    setEditedClientName(lead.leadDetails?.clientName || '');
                  }}
                />
              </div>
            )}
          </div>

          {/* Company and Contact Info */}
          <div className="text-sm text-gray-700 mb-3 italic">
            {lead.leadDetails?.companyName || 'No Company'}
          </div>

          <div className="text-xs text-gray-600 mb-2">
            📞{' '}
            <span className="text-blue-700 font-semibold">
              {lead.leadDetails?.contact || 'N/A'}
            </span>
            <br />
            📍 {lead.leadDetails?.location || 'N/A'}
          </div>

          {/* Email */}
          <div className="mb-4 mt-2">
            {editingEmailId === lead._id ? (
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="border px-1 py-0.5 rounded"
                />
                <button
                  onClick={() => handleEmailSave()}
                  className="ml-2 text-green-600 font-medium hover:underline"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingEmailId(null);
                    setEditedEmail('');
                  }}
                  className="ml-1 text-red-600 font-medium hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <span>{lead.leadDetails?.email || 'No email'}</span>
                <FaEdit
                  className="inline-block ml-2 text-gray-500 cursor-pointer hover:text-blue-600"
                  onClick={() => {
                    setEditingEmailId(lead._id);
                    setEditedEmail(lead.leadDetails?.email || '');
                  }}
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-4 flex flex-col items-center">
            <button
              onClick={() => router.push('/questions-form')}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-700 hover:from-indigo-600 hover:to-indigo-800 text-white py-2 text-sm font-semibold rounded shadow"
            >
              Go to Full Questions Page →
            </button>

            <button
  onClick={() =>
    handleWhatsAppMessage(
      lead.leadDetails?.contact,
      lead.leadDetails?.clientName
    )
  }
  className="mt-3 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
>
  WhatsApp Message
</button>

<button
  onClick={() =>
    handleWhatsAppPdfShare(
      lead.leadDetails?.contact,
      lead.leadDetails?.clientName,
      'gcb.pdf'  
    )
  }
  className="mt-3 ml-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
>
  WhatsApp Share PDF
</button>

          </div>
        </div>
      );
    })()
  )}
</div>
{/* New Action Plan / Remarks Section */}
<div className="mt-6 bg-white bg-opacity-80 rounded-xl shadow-lg p-4 backdrop-blur-sm max-w-xl mx-auto">
  <h2 className="text-lg font-semibold mb-2 text-blue-700">📝 Next Action Plan / Remarks</h2>

  <textarea
    value={actionPlan}
    onChange={(e) => setActionPlan(e.target.value)}
    placeholder="Type your next action plan or remarks here..."
    className="w-full min-h-[70px] p-2 border border-blue-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2 text-sm"
  />

  <div className="flex items-center gap-3 mb-3">
    <button
      onClick={handleSaveActionPlan}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md shadow font-semibold text-sm"
    >
      💾 Save
    </button>
    <button
      onClick={() => setShowActionPlans((prev) => !prev)}
      className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1.5 rounded-md shadow font-medium text-sm"
    >
      {showActionPlans ? 'Hide Saved' : 'Show Saved'}
    </button>
  </div>

  {/* Saved action plans display */}
  {showActionPlans && (savedActionPlansMap[filteredLeads[currentLeadIndex]?._id]?.length > 0) && (
  <div className="max-h-36 overflow-y-auto border border-blue-200 rounded-md p-2 bg-blue-50 text-blue-900 text-sm">
    {savedActionPlansMap[filteredLeads[currentLeadIndex]._id].map((plan, index) => (
      <div
        key={index}
        className="mb-1 p-1 border-b border-blue-300 last:border-b-0 break-words whitespace-pre-wrap"
      >
        {plan}
      </div>
    ))}
  </div>
)}

{showActionPlans &&
  (!savedActionPlansMap[filteredLeads[currentLeadIndex]?._id] ||
    savedActionPlansMap[filteredLeads[currentLeadIndex]._id].length === 0) && (
    <p className="text-blue-400 italic text-sm">No saved action plans yet.</p>
)}
</div>

<button 
  onClick={() => {
    localStorage.setItem('selectedLead', JSON.stringify(filteredLeads[currentLeadIndex]));
    window.location.href = '/leadDetails'; // static path to page
  }}
  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 center mx-auto block text-sm font-semibold shadow-lg"
>
  View Full Lead Card
</button>

    {/* Optional Pagination Controls */}
    <div className="flex justify-center gap-4 mt-8">
      <button
        onClick={goToPreviousLead}
        disabled={!hasPreviousLead}
        className={`px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm font-medium ${!hasPreviousLead ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Previous
      </button>
      <button
        onClick={goToNextLead}
        disabled={!hasNextLead}
        className={`px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium ${!hasNextLead ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Next
      </button>
    </div>

    <div className="text-center text-xs text-gray-500 mt-2">
      Showing {currentLeadIndex + 1} of {filteredLeads.length}
    </div>
  </div>
);
}
export default LeadTable;