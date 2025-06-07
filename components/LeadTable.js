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

const lead = filteredLeads[currentLeadIndex] || {};

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

             <div className="w-full max-w-xl mx-auto bg-white/90 rounded-3xl border border-indigo-100 shadow-2xl p-8 mb-8">
 {/* Client Name */}
<div className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2 w-full">
  {editingClientNameId === lead._id ? (
    <div className="flex items-center gap-2 w-full">
      <input
        type="text"
        value={editedClientName}
        onChange={(e) => setEditedClientName(e.target.value)}
        className="border border-indigo-300 bg-indigo-50 rounded px-2 py-1 text-base flex-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <button
        onClick={handleSave}
        className="text-green-700 bg-green-100 px-3 py-1 rounded font-medium hover:bg-green-200 transition"
      >
        Save
      </button>
      <button
        onClick={() => setEditingClientNameId(null)}
        className="text-red-600 bg-red-100 px-3 py-1 rounded font-medium hover:bg-red-200 transition"
      >
        Cancel
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2 w-full">
      <span className="truncate">{lead.leadDetails?.clientName || 'No Name'}</span>
      <FaEdit
        className="text-indigo-400 cursor-pointer hover:text-indigo-700 ml-1"
        onClick={() => {
          setEditingClientNameId(lead._id);
          setEditedClientName(lead.leadDetails?.clientName || '');
        }}
      />
    </div>
  )}
</div>

{/* Company */}
{lead.leadDetails?.companyName && (
  <div className="text-sm font-semibold mb-2 flex items-center gap-2 w-full">
    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full shadow">{lead.leadDetails.companyName}</span>
  </div>
)}

{/* Contact & Location */}
<div className="flex flex-wrap gap-2 text-sm mb-3 w-full">
  <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full shadow-sm">
    📞 <span className="font-semibold">{lead.leadDetails?.contact || 'N/A'}</span>
  </span>
  <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full shadow-sm">
    📍 {lead.leadDetails?.location || 'N/A'}
  </span>
</div>

{/* Email */}
<div className="mb-6 w-full">
  {editingEmailId === lead._id ? (
    <div className="flex items-center gap-2 w-full">
      <input
        type="email"
        value={editedEmail}
        onChange={(e) => setEditedEmail(e.target.value)}
        className="border border-indigo-300 bg-indigo-50 px-2 py-1 rounded text-sm flex-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <button
        onClick={handleEmailSave}
        className="text-green-700 bg-green-100 px-3 py-1 rounded font-medium hover:bg-green-200 transition"
      >
        Save
      </button>
      <button
        onClick={() => { setEditingEmailId(null); setEditedEmail(''); }}
        className="text-red-600 bg-red-100 px-3 py-1 rounded font-medium hover:bg-red-200 transition"
      >
        Cancel
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2 w-full">
      <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full truncate">{lead.leadDetails?.email || 'No email'}</span>
      <FaEdit
        className="text-indigo-400 cursor-pointer hover:text-indigo-700 ml-1"
        onClick={() => {
          setEditingEmailId(lead._id);
          setEditedEmail(lead.leadDetails?.email || '');
        }}
      />
    </div>
  )}
</div>
  </div>
  </div>
          </div>
        );
      })()}
    </div>

    <div className="flex flex-col gap-4 mt-6 w-full max-w-md mx-auto">
  <button
    onClick={handleCreateEnquiry}
    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-2xl text-base font-semibold shadow-lg transition"
    style={{ minHeight: 48, fontSize: "1rem" }}
  >
    📝 Questions Form
  </button>
  <div className="flex flex-col gap-4 w-full max-w-md mx-auto mt-4">
  <button
    onClick={() => handleWhatsAppMessage(lead.leadDetails?.contact, lead.leadDetails?.clientName)}
    className="w-full flex items-center justify-center bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-6 py-3 rounded-2xl text-base font-semibold shadow-lg transition duration-150"
    style={{ minHeight: 48, fontSize: "1rem" }}
  >
    📩 WhatsApp Message
  </button>
  <button
    onClick={() => handleWhatsAppPdfShare(lead.leadDetails?.contact, lead.leadDetails?.clientName, 'gcb.pdf')}
    className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-2xl text-base font-semibold shadow-lg transition duration-150"
    style={{ minHeight: 48, fontSize: "1rem" }}
  >
    📄 Share PDF via WhatsApp
  </button>
  <button
    onClick={() => handleGoToGallery(lead)}
    className="w-full flex items-center justify-center bg-gradient-to-r from-fuchsia-500 to-pink-400 hover:from-fuchsia-600 hover:to-pink-500 text-white px-6 py-3 rounded-2xl text-base font-semibold shadow-lg transition duration-150"
    style={{ minHeight: 48, fontSize: "1rem" }}
  >
    🖼️ Send Photos
  </button>
</div>

</div>

{/* Toggle Button */}
<button
  onClick={() => setShowRemarksSection(prev => !prev)}
  className="block mx-auto bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 text-white px-6 py-2 rounded-full shadow-lg mt-6 transition text-base font-semibold tracking-wide"
>
  {showRemarksSection ? 'Hide Remarks' : 'Show Remarks'}
</button>

{/* Remarks Section */}
{showRemarksSection && (
  <div className="mt-6 w-full max-w-2xl mx-auto bg-white/90 rounded-3xl shadow-2xl p-8 border border-indigo-100 backdrop-blur-xl">
    <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
      📝 <span>Next Action Plan / Remarks</span>
    </h2>
    <textarea
      value={actionPlan}
      onChange={(e) => setActionPlan(e.target.value)}
      placeholder="Type your next action plan or remarks here..."
      className="w-full min-h-[100px] p-4 text-base border-2 border-blue-200 rounded-2xl shadow focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-indigo-50 transition"
    />

    <div className="flex flex-col sm:flex-row items-center gap-4 mt-5">
      <button
        onClick={handleSaveActionPlan}
        className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-4 py-2 rounded-2xl text-base font-semibold shadow-md transition"
      >
        💾 Save
      </button>
      <button
        onClick={() => setShowActionPlans(prev => !prev)}
        className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-800 px-4 py-2 rounded-2xl text-base font-semibold shadow-md transition"
      >
        {showActionPlans ? 'Hide Saved' : 'Show Saved'}
      </button>
    </div>

    {/* Saved Plans */}
    {showActionPlans && (
      <div className="mt-5 max-h-40 overflow-y-auto bg-blue-50 border border-blue-200 rounded-xl p-4 text-base text-blue-800 space-y-2 shadow-inner">
        {(savedActionPlansMap[filteredLeads[currentLeadIndex]?._id] || []).length > 0 ? (
          savedActionPlansMap[filteredLeads[currentLeadIndex]._id].map((plan, index) => (
            <div key={index} className="border-b border-blue-200 last:border-0 pb-2">
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
<div className="flex flex-col md:flex-row md:justify-between items-center gap-4 mt-7 mb-3 w-full">
  <button
    onClick={() =>
      handleWeeklyReminderMessage(
        filteredLeads[currentLeadIndex]?.leadDetails?.contact,
        filteredLeads[currentLeadIndex]?.leadDetails?.clientName
      )
    }
    className="flex items-center bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold text-base px-6 py-3 rounded-2xl shadow-md transition gap-2"
  >
    <MdAlarm size={20} />
    Weekly Reminder
  </button>

  <button
    onClick={() => {
      localStorage.setItem(
        "selectedLead",
        JSON.stringify(filteredLeads[currentLeadIndex])
      );
      window.location.href = "/LeadDetails";
    }}
    className="flex items-center bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-md text-base font-semibold transition gap-2"
  >
    📋 View Full Lead Card
  </button>
</div>

{/* Lead Navigation */}
<div className="flex justify-center items-center gap-8 mt-8 mb-2">
  <button
    onClick={goToPreviousLead}
    disabled={!hasPreviousLead}
    className={`flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 font-medium text-base shadow transition ${
      !hasPreviousLead ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    <FaArrowLeft />
    Previous
  </button>

  <div className="text-base font-semibold text-indigo-600 px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-100 shadow">
    Showing {currentLeadIndex + 1} of {filteredLeads.length}
  </div>

  <button
    onClick={goToNextLead}
    disabled={!hasNextLead}
    className={`flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-medium text-base shadow transition ${
      !hasNextLead ? "opacity-50 cursor-not-allowed" : ""
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
