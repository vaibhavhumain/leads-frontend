import { useEffect, useState, useMemo } from 'react';
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
  const [newContactLeadId, setNewContactLeadId] = useState(null); 
  const [newContactNumber, setNewContactNumber] = useState('');
  const [newContactLabel, setNewContactLabel] = useState('');
  const [forwardModal , setForwardModal] = useState(false);
  const [leadToForward , setLeadToForward] = useState(null);
  const [forwardToUser , setForwardToUser] = useState("");    
const [contactPicker, setContactPicker] = useState({
  open: false,
  options: [],
  onSelect: null,  
  actionLabel: '',
});
const [showActionsSidebar , setShowActionsSidebar] = useState(false)
  const [selectedImages, setSelectedImages] = useState(new Set()); 

  const leadsPerPage = 3;

    const handleSave = () => {
    updateClientName(editingClientNameId);
};

// Utility to get a valid contact number (handles both contacts array and single contact)
const getAllValidContacts = (contactsArr, singleContact) => {
  let numbers = [];
  if (Array.isArray(contactsArr) && contactsArr.length > 0) {
    for (let c of contactsArr) {
      if (c && c.number) {
        let cleaned = c.number.replace(/\D/g, '');
        if (cleaned.length === 11 && cleaned.startsWith('0')) {
          cleaned = cleaned.substring(1);
        }
        if (/^\d{10}$/.test(cleaned)) {
          numbers.push({ label: c.label || 'Other', number: cleaned });
        }
      }
    }
  }
  if (typeof singleContact === 'string') {
    let cleaned = singleContact.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    if (/^\d{10}$/.test(cleaned)) {
      numbers.push({ label: 'Primary', number: cleaned });
    }
  }
  return numbers;
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

const filteredLeads = useMemo(() => {
  if (!searchTerm || !searchTerm.trim()) return leads;

  const term = searchTerm.toLowerCase().replace(/\D/g, ''); // for numbers, only digits
  const termString = searchTerm.toLowerCase();

  return leads.filter(lead => {
    // Name search (case-insensitive)
    const clientName = lead.leadDetails?.clientName?.toLowerCase() || '';
    if (clientName.includes(termString)) return true;

    // Main contact (can be string or number)
    const mainContact = (lead.leadDetails?.contact || '').replace(/\D/g, '');
    if (mainContact.includes(term)) return true;

    // Contacts array (check every number)
    const contacts = Array.isArray(lead.leadDetails?.contacts) ? lead.leadDetails.contacts : [];
    for (let c of contacts) {
      const num = (c?.number || '').replace(/\D/g, '');
      if (num.includes(term)) return true;
    }

    return false;
  });
}, [leads, searchTerm]); 

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


const handleWhatsAppPhotoShare = (contactsArr, singleContact, clientName = '', selectedImages) => {
  const number = getValidContact(contactsArr, singleContact);
  if (!number) {
    alert("Please enter a valid 10-digit contact number.");
    return;
  }
  if (!selectedImages || selectedImages.size === 0) {
    alert("No images selected to share.");
    return;
  }

  const origin = window.location.origin;
  const imageLinks = Array.from(selectedImages).map((id, idx) => `${origin}/images/${id}.jpg`);
  const imageText = imageLinks.map((link, idx) => `Image ${idx + 1}: ${link}`).join('\n');

  const message = encodeURIComponent(
    `Dear ${clientName || 'Customer'},\n\nHere are your requested bus images:\n${imageText}`
  );
  const url = `https://api.whatsapp.com/send?phone=91${number}&text=${message}`;
  window.open(url, '_blank');
};

const handleWeeklyReminderMessage = (contactsArr, singleContact, clientName = '') => {
  const number = getValidContact(contactsArr, singleContact);
  if (!number) {
    toast.error("Please enter a valid 10-digit contact number.");
    return;
  }

  const cleanedContact = contact.replace(/\D/g, '');
  const isValidContact = /^\d{10}$/.test(cleanedContact);
  if (!isValidContact) {
    toast.error("Please enter a valid 10-digit contact number.");
    return;
  }
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



const handleAddContact = async (leadId) => {
  const newNum = newContactNumber.trim().replace(/\D/g, '');
  if (!newNum || !/^\d{10}$/.test(newNum)) {
    toast.error('Please enter a valid 10-digit number');
    return;
  }
  
  const allContacts = leads.find(l => l._id === leadId)?.leadDetails?.contacts || [];
  const existingNumbers = allContacts.map(c => c.number.replace(/\D/g, '').slice(-10));
  if (existingNumbers.includes(newNum)) {
    toast.error('This number already exists in contacts!');
    return;
  }
  const label = newContactLabel.trim() || 'Alternate';

  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(
      `${BASE_URL}/api/leads/${leadId}/add-contact`,
      { number: newNum, label },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId
          ? {
              ...lead,
              leadDetails: {
                ...lead.leadDetails,
                contacts: [...(lead.leadDetails.contacts || []), { number: newNum, label }]
              }
            }
          : lead
      )
    );
    toast.success('Contact added!');
    setNewContactNumber('');
    setNewContactLabel('');
    setNewContactLeadId(null);
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Could not add contact');
  }
};

function copyToClipboard(text) {
  try {
    navigator.clipboard.writeText(text);
    toast.success('Message copied! If it is not pre-filled in WhatsApp, just paste.');
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    toast.success('Message copied! If it is not pre-filled in WhatsApp, just paste.');
  }
}
const sendWhatsAppMessage = (number, clientName = '') => {
  const text = `Dear ${clientName || 'Customer'}, It was a pleasure speaking with you today! Thank you for considering Gobind Coach Builders for your bus body requirements. We're excited about the opportunity to bring your vision to life with our durable designs and unmatched craftsmanship.`;

  const encodedText = encodeURIComponent(text);
  const phoneNumber = `91${number}`;

  const choice = window.confirm("Click OK to open in WhatsApp Web.\nClick Cancel to open in WhatsApp App.");

  const url = choice
    ? `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}` // Web
    : `https://wa.me/${phoneNumber}?text=${encodedText}`; // App or fallback

  console.log('WA URL:', url);
  window.open(url, '_blank');
  copyToClipboard(text);
};


const sendWhatsAppPdf = (number, clientName = '', pdfFileName) => {
  const origin = window.location.origin;
  const pdfUrl = `${origin}/${pdfFileName}`;
  const text = `Dear ${clientName || 'Customer'},\n\nPlease find the PDF here:\n${pdfUrl}`;
  const encodedText = encodeURIComponent(text);
  const phoneNumber = `91${number}`;

  const choice = window.confirm("Click OK to open in WhatsApp Web.\nClick Cancel to open in WhatsApp App.");

  const url = choice
    ? `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`  // Web
    : `https://wa.me/${phoneNumber}?text=${encodedText}`;                        // App

  window.open(url, '_blank');
  copyToClipboard(text);
};

const sendWeeklyReminder = (number, clientName = '') => {
  const storageKey = `weeklyReminder-${number}`;
  const lastSent = localStorage.getItem(storageKey);
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  if (lastSent && Date.now() - parseInt(lastSent, 10) < oneWeek) {
    toast.info("A weekly reminder was already sent in the last 7 days.");
    return;
  }

  const text = `Dear ${clientName || 'Customer'}, just a friendly reminder from Gobind Coach Builders! We're here to help with any updates or questions regarding your bus body needs. Feel free to reach out.`;
  const encodedText = encodeURIComponent(text);
  const phoneNumber = `91${number}`;

  const choice = window.confirm("Click OK to open in WhatsApp Web.\nClick Cancel to open in WhatsApp App.");

  const url = choice
    ? `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`  // Web
    : `https://wa.me/${phoneNumber}?text=${encodedText}`;                        // App

  window.open(url, '_blank');
  copyToClipboard(text);
  localStorage.setItem(storageKey, Date.now().toString());
  toast.success("Weekly reminder sent!");
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

   <div className="flex justify-center relative px-6 py-8 bg-[#e9f0ff] rounded-3xl shadow-lg max-w-6xl mx-auto">
  {filteredLeads.length > 0 && (() => {
    const lead = filteredLeads[currentLeadIndex];
    const isFrozenByCreator =
      lead.createdBy?._id === loggedInUser?._id &&
      lead.forwardedTo?.user?._id &&
      lead.isFrozen;

    return (
      <div className="relative flex gap-12 w-full max-w-5xl">
        {/* Frozen Overlay */}
        {isFrozenByCreator && (
          <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-3xl border border-red-300">
            <div className="text-center px-4">
              <p className="text-red-600 font-semibold text-lg mb-1">
                🔒 This lead has been forwarded and is now frozen.
              </p>
              <p className="text-gray-600 text-sm">You cannot make any changes.</p>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <div className="flex flex-col gap-6 py-2 min-w-[200px]">
          <button
            onClick={() => {
              const validContacts = getAllValidContacts(lead.leadDetails?.contacts, lead.leadDetails?.contact);
              if (validContacts.length === 0) {
                toast.error("No valid 10-digit contact found!");
                return;
              }
              if (validContacts.length === 1) {
                sendWhatsAppMessage(validContacts[0].number, lead.leadDetails?.clientName || '');
              } else {
                setContactPicker({
                  open: true,
                  options: validContacts,
                  onSelect: (number) => sendWhatsAppMessage(number, lead.leadDetails?.clientName || ''),
                  actionLabel: "Send WhatsApp Message",
                });
              }
            }}
            className="flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold text-white bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-lg transition hover:scale-105"
          >
            <span role="img" aria-label="whatsapp" className="text-2xl">📩</span> WhatsApp
          </button>

          <button
            onClick={() => {
              const validContacts = getAllValidContacts(lead.leadDetails?.contacts, lead.leadDetails?.contact);
              if (validContacts.length === 0) {
                toast.error("No valid 10-digit contact found!");
                return;
              }
              if (validContacts.length === 1) {
                sendWhatsAppPdf(validContacts[0].number, lead.leadDetails?.clientName || '', 'gcb.pdf');
              } else {
                setContactPicker({
                  open: true,
                  options: validContacts,
                  onSelect: (number) => sendWhatsAppPdf(number, lead.leadDetails?.clientName || '', 'gcb.pdf'),
                  actionLabel: "Send PDF",
                });
              }
            }}
            className="flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold text-white bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg transition hover:scale-105"
          >
            <span role="img" aria-label="pdf" className="text-2xl">📄</span> PDF
          </button>
          

          <Link href="/gallery" passHref legacyBehavior>
            <a>
              <button
                className="flex items-center justify-center gap-3 rounded-xl px-8 py-4 text-lg font-semibold text-white bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 shadow-lg transition hover:scale-105"
              >
                <span role="img" aria-label="photos" className="text-2xl">🖼️</span> Photos
              </button>
            </a>
          </Link>
        </div>
        
            <div
              key={lead._id}
              className={`bg-gradient-to-br from-white via-[#f3f8ff] to-[#d9e9ff] p-6 rounded-3xl shadow-2xl border border-blue-100 w-full max-w-xl transition duration-300 hover:shadow-blue-200 relative z-10 ${
                isFrozenByCreator ? 'pointer-events-none opacity-70' : ''
              }`}
            >
              <div className="text-xs text-gray-500 mb-2 font-semibold">
                #{currentLeadIndex + 1} • Created by: <span className="text-indigo-600">{lead.createdBy?.name || 'N/A'}</span>
              </div>
               {contactPicker.open && (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs flex flex-col items-center border border-indigo-200">
          <div className="mb-4 text-lg font-semibold text-indigo-700">
            Select number to {contactPicker.actionLabel}
          </div>
          {contactPicker.options.map((c, idx) => (
            <button
              key={idx}
              className="w-full my-1 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-200 text-indigo-800 font-medium transition"
              onClick={() => {
                contactPicker.onSelect(c.number);
                setContactPicker(prev => ({ ...prev, open: false }));
              }}
            >
              {c.label}: {c.number}
            </button>
          ))}
          <button
            onClick={() => setContactPicker(prev => ({ ...prev, open: false }))}
            className="mt-4 text-xs text-gray-400 hover:text-rose-500"
          >
            Cancel
          </button>
        </div>
      </div>
    )}

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

{/* Location */}
<div className="flex flex-wrap gap-2 text-sm mb-3 w-full">
{/* Contact Numbers Section */}
<div className="mb-3 w-full">
  {/* Add New Contact */}
  {/* Display All Contact Numbers */}
<div className="flex flex-wrap gap-2 mb-2">
  {(lead.leadDetails?.contacts && lead.leadDetails.contacts.length > 0) ? (
    lead.leadDetails.contacts.map((c, idx) => (
      <span key={idx} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full shadow-sm">
        📞 <span className="font-semibold">{c.number}</span>
        <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">
          {c.label || 'Other'}
        </span>
        {/* WhatsApp button per number */}
        <button
          onClick={() => sendWhatsAppMessage(c.number, lead.leadDetails?.clientName)}
          className="ml-1 text-green-600 hover:text-green-800"
          title="Send WhatsApp"
        > 
          <svg xmlns="http://www.w3.org/2000/svg" className="inline-block" width={18} height={18} viewBox="0 0 24 24"><path fill="currentColor" d="M12.001 2.002a9.931 9.931 0 0 0-9.936 9.926a9.861 9.861 0 0 0 1.355 5.025l-1.497 4.389a1 1 0 0 0 1.261 1.263l4.396-1.5a9.935 9.935 0 0 0 4.42 1.036c5.507 0 9.982-4.474 9.982-9.98c0-5.505-4.475-9.959-9.981-9.959Zm0 1.999c4.42 0 7.983 3.564 7.983 7.983c0 4.42-3.563 7.983-7.983 7.983c-1.456 0-2.871-.393-4.086-1.133a1 1 0 0 0-.794-.097l-2.642.902l.903-2.638a1 1 0 0 0-.101-.803a7.958 7.958 0 0 1-1.26-4.214c0-4.42 3.563-7.983 7.983-7.983Zm3.956 6.92c-.061-.035-.119-.071-.182-.104c-.243-.128-1.438-.706-1.661-.786c-.222-.08-.385-.128-.548.128c-.161.256-.629.786-.77.949c-.142.163-.284.184-.526.062c-.242-.123-1.021-.375-1.945-1.197c-.72-.64-1.207-1.429-1.35-1.67c-.141-.242-.016-.373.106-.492c.108-.107.241-.28.36-.418c.118-.139.157-.237.238-.396c.081-.16.04-.3-.02-.418c-.06-.122-.547-1.318-.749-1.8c-.197-.473-.399-.409-.547-.417c-.142-.007-.304-.009-.467-.009c-.161 0-.423.06-.645.28c-.221.22-.845.827-.845 2.016c0 1.188.866 2.338.987 2.499c.121.16 1.704 2.6 4.132 3.543c.578.199 1.028.317 1.379.406c.579.146 1.107.125 1.524.076c.465-.054 1.437-.587 1.641-1.154c.202-.567.202-1.052.143-1.153c-.06-.1-.167-.14-.349-.225Z"></path></svg>
        </button>
      </span>
    ))
  ) : (
    <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full shadow-sm">
      📞 <span className="font-semibold">N/A</span>
    </span>
  )}
</div>
{/* Add Contact Input */}
{newContactLeadId === lead._id ? (
  <div className="flex items-center gap-2 mt-2">
    <input
      type="text"
      placeholder="New Number"
      value={newContactNumber}
      onChange={(e) => setNewContactNumber(e.target.value)}
      className="border border-blue-300 rounded px-2 py-1 text-sm"
      maxLength={10}
    />
    <input
      type="text"
      placeholder="Label (Optional)"
      value={newContactLabel}
      onChange={(e) => setNewContactLabel(e.target.value)}
      className="border border-blue-300 rounded px-2 py-1 text-sm"
    />
    <button
      onClick={() => handleAddContact(lead._id)}
      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
    >
      Add
    </button>
    <button
      onClick={() => { setNewContactLeadId(null); setNewContactNumber(''); setNewContactLabel(''); }}
      className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
    >
      Cancel
    </button>
  </div>
) : (
  <button
    onClick={() => setNewContactLeadId(lead._id)}
    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded font-semibold mt-2"
  >
    + Add Contact
  </button>
)}


</div>


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


  <div className="flex justify-end mt-auto">
    <button
      onClick={() => {
        sessionStorage.setItem("selectedLead", JSON.stringify({ lead }));
        window.location.href = "/LeadDetails";
      }}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-xl shadow text-xs font-medium transition"
    >
      <span role="img" aria-label="card">🗂️</span>
      View Lead Card
    </button>

  </div>
</div>
  </div>
  </div>
          </div>
        );
      })()}
    </div>

    <div className="flex flex-col gap-4 mt-6 w-full max-w-md mx-auto">
  <button>
  <Link
  href={`/EnquiryForm?leadId=${lead._id}`}
  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-2xl text-base font-semibold shadow-lg transition flex justify-center items-center"
  style={{ minHeight: 48, fontSize: "1rem" }}
>
  📝 Questions Form
</Link>
</button>
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
  onClick={() => {
    const validContacts = getAllValidContacts(lead.leadDetails?.contacts, lead.leadDetails?.contact);
    if (validContacts.length === 0) {
      toast.error("No valid 10-digit contact found!");
      return;
    }
    if (validContacts.length === 1) {
      sendWeeklyReminder(validContacts[0].number, lead.leadDetails?.clientName || '');
    } else {
      setContactPicker({
        open: true,
        options: validContacts,
        onSelect: (number) => sendWeeklyReminder(number, lead.leadDetails?.clientName || ''),
        actionLabel: "Send Weekly Reminder",
      });
    }
  }}
  className="flex items-center gap-2 rounded-xl px-5 py-2 text-base font-semibold text-white bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-500 shadow-lg transition-all duration-150 hover:scale-105 hover:shadow-xl active:scale-97 focus:outline-none whitespace-nowrap"
>
  <span role="img" aria-label="reminder">⏰</span>
  Reminder
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