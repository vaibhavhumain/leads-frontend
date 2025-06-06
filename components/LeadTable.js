import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import BASE_URL from '../utils/api';
import { FaEdit } from 'react-icons/fa';
import { useRouter } from 'next/router';
const STATUS_OPTIONS = ['Hot', 'Warm', 'Cold'];
import { MdAlarm } from 'react-icons/md';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';


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
  const [showRemarksSection , setShowRemarksSection] = useState(false);
  const [uploadedImages, setUploadedImages] = useState({});


  const leadsPerPage = 3;

    const handleSave = () => {
    updateClientName(editingClientNameId);
};

useEffect(() => {
  const fetchActionPlansForCurrentLead = async () => {
    const currentLead = filteredLeads[currentLeadIndex];
    if (!currentLead?._id) return;

    try {
      const res = await fetch(`${BASE_URL}/api/leads/${currentLead._id}/actionPlans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setSavedActionPlansMap((prev) => ({
          ...prev,
          [currentLead._id]: data.actionPlans.map(plan => plan.text),
        }));
      } else {
        console.warn('Failed to fetch saved action plans');
      }
    } catch (err) {
      console.error('Error fetching action plans:', err);
    }
  };

  fetchActionPlansForCurrentLead();
}, [currentLeadIndex]);

const handleCreateEnquiry = () => {
    router.push('/EnquiryForm'); 
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


const handleImageUpload = async (e, leadId, contact, clientName) => {
  const file = e.target.files[0];
  if (!file) return;

  const cleanedContact = contact?.replace(/\D/g, '');

  if (!cleanedContact || !/^\d{10}$/.test(cleanedContact)) {
    toast.error('❌ Invalid contact number');
    return;
  }

  const formData = new FormData();
  formData.append('images', file);

  try {
    const res = await fetch(`${BASE_URL}/api/upload/upload-images`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.success && data.images.length > 0) {
      const imageUrl = data.images[0];

      setUploadedImages((prev) => ({ ...prev, [leadId]: imageUrl }));

      toast.success('✅ Image uploaded! Redirecting to gallery...');

      setTimeout(() => {
        window.location.href = `/gallery?phone=${cleanedContact}&name=${encodeURIComponent(clientName)}&img=${encodeURIComponent(imageUrl)}`;
      }, 1500);
    } else {
      toast.error('❌ Image upload failed');
    }
  } catch (err) {
    console.error(err);
    toast.error('❌ Something went wrong while uploading.');
  }
};


const handleSendUploadedImage = (contact, clientName = '', imagePath = '') => {
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

  if (!imagePath) {
    alert("Image path is required. Please upload an image first.");
    return;
  }

  const fullImageUrl = `${BASE_URL}${imagePath}`;

  const message = encodeURIComponent(
    `Dear ${clientName || 'Customer'},\n\nIt was a pleasure speaking with you today! Thank you for considering Gobind Coach Builders for your bus body requirements. We’re excited about the opportunity to bring your vision to life.\n\nPlease check this image:\n${fullImageUrl}`
  );

  const url = `https://api.whatsapp.com/send?phone=91${cleanedContact}&text=${message}`;
  window.open(url, '_blank');
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

// Sends a link to the GC Builders Database on WhatsApp
const handleSendGcDatabaseLink = (contact, clientName = '') => {
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

  const gcDatabaseUrl = 'https://gc-database.netlify.app/';
  const message = encodeURIComponent(
    `Dear ${clientName || 'Customer'}, please visit our GC Builders Database for detailed bus body options: ${gcDatabaseUrl}`
  );

  const url = `https://api.whatsapp.com/send?phone=91${cleanedContact}&text=${message}`;
  window.open(url, '_blank');
};



const handleWhatsAppPhotoShare = (contact, clientName = '', selectedImages) => {
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

  if (!selectedImages || selectedImages.size === 0) {
    alert("No images selected to share.");
    return;
  }

  // Wherever you're triggering the gallery page (e.g. Dashboard)


  // Build message
  const origin = window.location.origin;
  const imageLinks = Array.from(selectedImages).map((id, idx) => `${origin}/images/${id}.jpg`);
  const imageText = imageLinks.map((link, idx) => `Image ${idx + 1}: ${link}`).join('\n');

  const message = encodeURIComponent(
    `Dear ${clientName || 'Customer'},\n\nHere are your requested bus images:\n${imageText}`
  );

  const url = `https://api.whatsapp.com/send?phone=91${cleanedContact}&text=${message}`;
  window.open(url, '_blank');
};



const handleGoToGallery = (lead) => {
  const query = new URLSearchParams({
    contact: lead.leadDetails?.contact,
    name: lead.leadDetails?.clientName,
  }).toString();

  window.location.href = `/gallery?${query}`;
};

const handleWeeklyReminderMessage = (contact, clientName = '') => {
  if (!contact || typeof contact !== 'string') {
    toast.error("Contact is invalid or missing");
    return;
  }

  const cleanedContact = contact.replace(/\D/g, '');
  const isValidContact = /^\d{10}$/.test(cleanedContact);
  if (!isValidContact) {
    toast.error("Please enter a valid 10-digit contact number.");
    return;
  }
  
  // Check if a weekly reminder was sent in the last 7 days
  const storageKey = `weeklyReminder-${cleanedContact}`;
  const lastSent = localStorage.getItem(storageKey);
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  if (lastSent && Date.now() - parseInt(lastSent, 10) < oneWeek) {
    toast.info("A weekly reminder was already sent in the last 7 days.");
    return;
  }

  const reminderMessage = encodeURIComponent(
    `Dear ${clientName || 'Customer'}, just a friendly reminder from Gobind Coach Builders! We're here to help with any updates or questions regarding your bus body needs. Feel free to reach out.`
  );

  const url = `https://api.whatsapp.com/send?phone=91${cleanedContact}&text=${reminderMessage}`;
  window.open(url, '_blank');
  localStorage.setItem(storageKey, Date.now().toString());
  toast.success("Weekly reminder sent!");
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
  <div className="w-full px-4 py-8 bg-gradient-to-br from-[#f0f4ff] via-[#e6f0ff] to-[#dceeff] min-h-screen font-sans">
    {isAdminTable && (
      <div className="flex justify-end mb-6">
        <button
          onClick={handleDeleteAllLeads}
          className="bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md"
        >
          ❌ Delete All Leads
        </button>
      </div>
    )}

    <div className="flex justify-center relative">
      {filteredLeads.length > 0 && (() => {
        const lead = filteredLeads[currentLeadIndex];
        const isFrozenByCreator =
          lead.createdBy?._id === loggedInUser?._id &&
          lead.forwardedTo?.user?._id &&
          lead.isFrozen;

        return (
          <div className="relative">
            {isFrozenByCreator && (
              <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-3xl border border-red-200">
                <div className="text-center px-4">
                  <p className="text-red-600 font-semibold text-lg mb-1">
                    🔒 This lead has been forwarded and is now frozen.
                  </p>
                  <p className="text-gray-600 text-sm">You cannot make any changes.</p>
                </div>
              </div>
            )}

            <div
              key={lead._id}
              className={`bg-gradient-to-br from-white via-[#f3f8ff] to-[#d9e9ff] p-6 rounded-3xl shadow-2xl border border-blue-100 w-full max-w-xl transition duration-300 hover:shadow-blue-200 relative z-10 ${
                isFrozenByCreator ? 'pointer-events-none opacity-70' : ''
              }`}
            >
              <div className="text-xs text-gray-500 mb-2 font-semibold">
                #{currentLeadIndex + 1} • Created by: <span className="text-indigo-600">{lead.createdBy?.name || 'N/A'}</span>
              </div>

              {/* Client Name */}
              <div className="text-lg font-semibold text-gray-700 mb-1">
                {editingClientNameId === lead._id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedClientName}
                      onChange={(e) => setEditedClientName(e.target.value)}
                      className="border border-indigo-300 rounded px-2 py-1 text-sm w-full"
                    />
                    <button onClick={handleSave} className="text-green-600 text-sm font-medium hover:underline">Save</button>
                    <button onClick={() => setEditingClientNameId(null)} className="text-red-500 text-sm font-medium hover:underline">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{lead.leadDetails?.clientName || 'No Name'}</span>
                    <FaEdit className="text-gray-500 cursor-pointer hover:text-blue-600" onClick={() => {
                      setEditingClientNameId(lead._id);
                      setEditedClientName(lead.leadDetails?.clientName || '');
                    }} />
                  </div>
                )}
              </div>

              {/* Company */}
              <div className="text-sm text-gray-600 italic mb-1">
                {lead.leadDetails?.companyName || 'No Company'}
              </div>

              {/* Contact & Location */}
              <div className="text-xs text-gray-500 mb-2">
                📞 <span className="text-blue-800 font-semibold">{lead.leadDetails?.contact || 'N/A'}</span><br />
                📍 {lead.leadDetails?.location || 'N/A'}
              </div>

              {/* Email */}
              <div className="mb-4">
                {editingEmailId === lead._id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="border border-indigo-300 px-2 py-1 rounded text-sm"
                    />
                    <button onClick={handleEmailSave} className="text-green-600 text-sm font-medium hover:underline">Save</button>
                    <button onClick={() => { setEditingEmailId(null); setEditedEmail(''); }} className="text-red-600 text-sm font-medium hover:underline">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{lead.leadDetails?.email || 'No email'}</span>
                    <FaEdit className="text-gray-500 cursor-pointer hover:text-blue-600" onClick={() => {
                      setEditingEmailId(lead._id);
                      setEditedEmail(lead.leadDetails?.email || '');
                    }} />
                  </div>
                  
                )}
                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 w-full">
  <button
    onClick={handleCreateEnquiry}
    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition"
  >
    📝 Questions Form
  </button>

  <button
    onClick={() => handleWhatsAppMessage(lead.leadDetails?.contact, lead.leadDetails?.clientName)}
    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition"
  >
    📩 WhatsApp Message
  </button>

  

  <button
    onClick={() => handleWhatsAppPdfShare(lead.leadDetails?.contact, lead.leadDetails?.clientName, 'gcb.pdf')}
    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition"
  >
    📄 Share PDF via WhatsApp
  </button>

  <button
  onClick={() => handleGoToGallery(lead)}
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md text-sm"
>
  Send Photos
</button>

</div>


              </div>
            </div>
          </div>
        );
      })()}
    </div>
{/* Toggle Button */}
<button
  onClick={() => setShowRemarksSection(prev => !prev)}
  className="block mx-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-md shadow mt-5 transition duration-300 text-sm font-medium"
>
  {showRemarksSection ? 'Hide Remarks' : 'Show Remarks'}
</button>

{/* Remarks Section */}
{showRemarksSection && (
  <div className="mt-4 bg-white/80 rounded-2xl shadow-md p-5 max-w-xl mx-auto backdrop-blur-sm border border-blue-200">
    <h2 className="text-lg font-bold text-blue-700 mb-3">📝 Next Action Plan / Remarks</h2>

    <textarea
      value={actionPlan}
      onChange={(e) => setActionPlan(e.target.value)}
      placeholder="Type your next action plan or remarks here..."
      className="w-full min-h-[80px] p-3 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
    />

    <div className="flex items-center gap-3 mt-3">
      <button
        onClick={handleSaveActionPlan}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm shadow"
      >
        💾 Save
      </button>
      <button
        onClick={() => setShowActionPlans(prev => !prev)}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1.5 rounded-md text-sm shadow"
      >
        {showActionPlans ? 'Hide Saved' : 'Show Saved'}
      </button>
    </div>

    {/* Saved Plans */}
    {showActionPlans && (
      <div className="mt-3 max-h-36 overflow-y-auto bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 space-y-1">
        {(savedActionPlansMap[filteredLeads[currentLeadIndex]?._id] || []).length > 0 ? (
          savedActionPlansMap[filteredLeads[currentLeadIndex]._id].map((plan, index) => (
            <div key={index} className="border-b border-blue-300 last:border-0 pb-1">
              {plan}
            </div>
          ))
        ) : (
          <p className="text-blue-400 italic">No saved action plans yet.</p>
        )}
      </div>
    )}
  </div>
)}


    {/* Weekly Reminder & Lead Card Button */}
    <div className="flex flex-col items-center mt-6 space-y-3">
      <button onClick={() => handleWeeklyReminderMessage(filteredLeads[currentLeadIndex]?.leadDetails?.contact, filteredLeads[currentLeadIndex]?.leadDetails?.clientName)} className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-5 py-2 rounded-lg shadow transition">
        <MdAlarm className="mr-2" size={18} /> Weekly Reminder
      </button>

      <button onClick={() => {
        localStorage.setItem('selectedLead', JSON.stringify(filteredLeads[currentLeadIndex]));
        window.location.href = '/leadKi';
      }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md text-sm">
        📋 View Full Lead Card
      </button>

      
      

      {/* <button
    onClick={() => handleSendGcDatabaseLink(filteredLeads[currentLeadIndex]?.leadDetails?.contact, filteredLeads[currentLeadIndex]?.leadDetails?.clientName)}
    className="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md text-sm center"
  >
    Send GC database to WhatsApp
  </button> */}

    </div>
    <div className="flex justify-center gap-4 mt-8">
  <button
    onClick={goToPreviousLead}
    disabled={!hasPreviousLead}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium transition ${
      !hasPreviousLead ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    <FaArrowLeft />
    Previous
  </button>

  <button
    onClick={goToNextLead}
    disabled={!hasNextLead}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition ${
      !hasNextLead ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    Next
    <FaArrowRight />
  </button>
</div>

    <div className="text-center text-xs text-gray-500 mt-2">
      Showing {currentLeadIndex + 1} of {filteredLeads.length}
    </div>
  </div>
);

}
export default LeadTable;
