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
import EnquiryForm from '../pages/EnquiryForm';
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);


const LeadTable = ({ leads, setLeads, searchTerm, isAdminTable = false, isSearchActive = false }) => {
  const [users, setUsers] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState({});
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
  const [editingCompanyNameId, setEditingCompanyNameId] = useState(null);
  const [editedCompanyName, setEditedCompanyName] = useState('');
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [editedLocation, setEditedLocation] = useState('');
  const [editingPrimaryContactId, setEditingPrimaryContactId] = useState(null);
  const [editedPrimaryContact, setEditedPrimaryContact] = useState('');



  const leadsPerPage = 3;

    const handleSave = () => {
    updateClientName(editingClientNameId);
};

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

  const term = searchTerm.toLowerCase().replace(/\D/g, ''); 
  const termString = searchTerm.toLowerCase();

  return leads.filter(lead => {
    const clientName = lead.leadDetails?.clientName?.toLowerCase() || '';
    if (clientName.includes(termString)) return true;
    const mainContact = (lead.leadDetails?.contact || '').replace(/\D/g, '');
    if (mainContact.includes(term)) return true;
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
const sendWhatsAppMessage = (lead) => {
  const numbers = getAllValidContacts(lead.leadDetails?.contacts, lead.leadDetails?.contact);
  if (!numbers.length) {
    toast.error("No valid contact numbers found.");
    return;
  }

  // Prompt for number
  const index = parseInt(prompt(
    numbers.map((c, i) => `${i + 1}. ${c.label}: ${c.number}`).join('\n') + `\n\nSelect number 1-${numbers.length}`
  )) - 1;

  if (isNaN(index) || index < 0 || index >= numbers.length) {
    toast.error("Invalid selection");
    return;
  }

  const selectedNumber = numbers[index].number;
  const phoneNumber = `91${selectedNumber}`;
  const clientName = lead.leadDetails?.clientName || 'Customer';
  const message = `Dear ${clientName}, this is Akshat Mudgal from Gobind Coach Builders.  
Thank you for your time on the call today.
As discussed, we specialize in manufacturing high-quality bus bodies – from school buses to luxury coaches – custom-built as per your needs.

If you ever require a reliable bus body partner, feel free to reach out.  
Would be happy to assist you with designs, specs, or quotations.

Our legacy of 30+ years, 200+ skilled workers, and a dedicated team ensures quality you can trust.

Looking forward to staying in touch!  
Regards,  
Akshat Mudgal  
Business Development Executive  
Gobind Coach Builders
7888837540
`;

  const encodedText = encodeURIComponent(message);

  // Prompt for app vs web
  const openInApp = confirm("Click OK to open in WhatsApp App\nClick Cancel to open in WhatsApp Web");

  const url = openInApp
    ? `https://wa.me/${phoneNumber}?text=${encodedText}`
    : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;

  // Copy to clipboard and open
  copyToClipboard(message);
  window.location.href = url; // ✅ Use location.href to ensure redirection
};

const notSendWhatsAppMessage = (lead) => {
  const numbers = getAllValidContacts(lead.leadDetails?.contacts, lead.leadDetails?.contact);
  if (!numbers.length) {
    toast.error("No valid contact numbers found.");
    return;
  }

  // Prompt for number
  const index = parseInt(prompt(
    numbers.map((c, i) => `${i + 1}. ${c.label}: ${c.number}`).join('\n') + `\n\nSelect number 1-${numbers.length}`
  )) - 1;

  if (isNaN(index) || index < 0 || index >= numbers.length) {
    toast.error("Invalid selection");
    return;
  }

  const selectedNumber = numbers[index].number;
  const phoneNumber = `91${selectedNumber}`;
  const clientName = lead.leadDetails?.clientName || 'Customer';
  const message = `Dear ${clientName}, this is Akshat Mudgal from Gobind Coach Builders.  
I tried reaching you over a quick call regarding your bus body requirements.

We’re a trusted name with 30+ years in manufacturing bus bodies – school, staff, AC luxury, and more – tailored to your business needs.

Let me know a convenient time to connect or feel free to reply here if you’d like more info.

Regards,  
Akshat Mudgal  
Business Development Executive  
Gobind Coach Builders
7888837540
`;

  const encodedText = encodeURIComponent(message);

  // Prompt for app vs web
  const openInApp = confirm("Click OK to open in WhatsApp App\nClick Cancel to open in WhatsApp Web");

  const url = openInApp
    ? `https://wa.me/${phoneNumber}?text=${encodedText}`
    : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;

  // Copy to clipboard and open
  copyToClipboard(message);
  window.location.href = url; // ✅ Use location.href to ensure redirection
};


const sendWhatsAppPdf = (lead, pdfFileName = 'gcb.pdf') => {
  const numbers = getAllValidContacts(lead.leadDetails?.contacts, lead.leadDetails?.contact);
  if (!numbers.length) {
    toast.error("No valid contact numbers found.");
    return;
  }

  const index = parseInt(prompt(
    numbers.map((c, i) => `${i + 1}. ${c.label}: ${c.number}`).join('\n') + `\n\nSelect number 1-${numbers.length}`
  )) - 1;

  if (isNaN(index) || index < 0 || index >= numbers.length) {
    toast.error("Invalid selection");
    return;
  }

  const selectedNumber = numbers[index].number;
  const phoneNumber = `91${selectedNumber}`;
  const origin = window.location.origin;
  const pdfUrl = `${origin}/${pdfFileName}`;
  const clientName = lead.leadDetails?.clientName || 'Customer';
  const message = `Dear ${clientName},\n\nPlease find the PDF here:\n${pdfUrl}`;
  const encodedText = encodeURIComponent(message);

  const openInApp = confirm("Click OK to open in WhatsApp App\nClick Cancel to open in WhatsApp Web");

  const url = openInApp
    ? `https://wa.me/${phoneNumber}?text=${encodedText}`
    : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;

  copyToClipboard(message);
  window.location.href = url;
};

const sendWeeklyReminder = (lead) => {
  const numbers = getAllValidContacts(lead.leadDetails?.contacts, lead.leadDetails?.contact);
  if (!numbers.length) {
    toast.error("No valid contact numbers found.");
    return;
  }

  const index = parseInt(prompt(
    numbers.map((c, i) => `${i + 1}. ${c.label}: ${c.number}`).join('\n') + `\n\nSelect number 1-${numbers.length}`
  )) - 1;

  if (isNaN(index) || index < 0 || index >= numbers.length) {
    toast.error("Invalid selection");
    return;
  }

  const selectedNumber = numbers[index].number;
  const phoneNumber = `91${selectedNumber}`;
  const clientName = lead.leadDetails?.clientName || 'Customer';
  const message = `Dear ${clientName}, just a friendly reminder from Gobind Coach Builders! We're here to help with any updates or questions regarding your bus body needs. Feel free to reach out.`;
  const encodedText = encodeURIComponent(message);
  const storageKey = `weeklyReminder-${selectedNumber}`;
  const lastSent = localStorage.getItem(storageKey);
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  if (lastSent && Date.now() - parseInt(lastSent, 10) < oneWeek) {
    toast.info("A weekly reminder was already sent in the last 7 days.");
    return;
  }

  const openInApp = confirm("Click OK to open in WhatsApp App\nClick Cancel to open in WhatsApp Web");

  const url = openInApp
    ? `https://wa.me/${phoneNumber}?text=${encodedText}`
    : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;

  copyToClipboard(message);
  localStorage.setItem(storageKey, Date.now().toString());
  window.location.href = url;
  toast.success("Weekly reminder sent!");
};


const goToPreviousLead = () => {
  if (currentLeadIndex > 0) {
    setCurrentLeadIndex(prev => prev - 1);
  }
};

const goToNextLead = () => {
  if (currentLeadIndex < filteredLeads.length - 1) {
    setCurrentLeadIndex(prev => prev + 1);
  }
};

const handleDeleteLead = async (leadId) => {
  const confirmDelete = window.confirm('⚠️ Are you sure you want to delete this lead? This cannot be undone.');
  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${BASE_URL}/api/leads/deleteByUser/${leadId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setLeads((prev) => prev.filter((lead) => lead._id !== leadId));
    toast.success('Lead deleted successfully');
  } catch (error) {
    console.error('Error deleting lead:', error);
    toast.error(error?.response?.data?.message || 'Failed to delete lead');
  }
};
const updateCompanyName = async (leadId) => {
  const token = localStorage.getItem('token');
  if (!editedCompanyName.trim()) {
    toast.warning('Company name cannot be empty');
    return;
  }

  try {
    const response = await axios.put(
      `${BASE_URL}/api/leads/${leadId}/company-name`,
      { companyName: editedCompanyName },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success('Company name updated ✅');
    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId
          ? {
              ...lead,
              leadDetails: {
                ...lead.leadDetails,
                companyName: editedCompanyName,
              },
            }
          : lead
      )
    );
    setEditingCompanyNameId(null);
    setEditedCompanyName('');
  } catch (err) {
    console.error('Failed to update company name', err);
    toast.error('Update failed');
  }
};

const updateLocation = async (leadId) => {
  const token = localStorage.getItem('token');
  if (!editedLocation.trim()) {
    toast.warning('Location cannot be empty');
    return;
  }

  try {
    const response = await axios.put(
      `${BASE_URL}/api/leads/${leadId}/location`,
      { location: editedLocation },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success('Location updated ✅');
    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId
          ? {
              ...lead,
              leadDetails: {
                ...lead.leadDetails,
                location: editedLocation,
              },
            }
          : lead
      )
    );
    setEditingLocationId(null);
    setEditedLocation('');
  } catch (err) {
    console.error('Failed to update location', err);
    toast.error('Update failed');
  }
};


const updatePrimaryContact = async (leadId) => {
  const token = localStorage.getItem('token');
  const cleaned = editedPrimaryContact.trim().replace(/\D/g, '');

  if (!/^\d{10}$/.test(cleaned)) {
    toast.warning('Enter a valid 10-digit contact number');
    return;
  }

  try {
    await axios.put(
      `${BASE_URL}/api/leads/${leadId}/primary-contact`,
      { contact: cleaned },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success('Primary contact updated ✅');
    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId
          ? {
              ...lead,
              leadDetails: {
                ...lead.leadDetails,
                contact: cleaned,
              },
            }
          : lead
      )
    );
    setEditingPrimaryContactId(null);
    setEditedPrimaryContact('');
  } catch (err) {
    console.error('Failed to update contact', err);
    toast.error('Update failed');
  }
};



if (!loggedInUser) return null;

const lead = filteredLeads[currentLeadIndex];
const isFrozenByCreator =
  lead?.createdBy?._id === loggedInUser?._id &&
  lead?.forwardedTo?.user?._id &&
  lead?.isFrozen;

if (!lead) return null;


return (
    <div className="w-full px-4 py-8 bg-[#e9f0ff] min-h-screen font-sans">
      {isAdminTable && (
        <div className="flex justify-end mb-6">
          <button
            onClick={handleDeleteAllLeads}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold"
          >
            ❌ Delete All Leads
          </button>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-6xl mx-auto relative">
        {isFrozenByCreator && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl border border-red-300">
            <div className="text-center px-4">
              <p className="text-red-600 font-semibold text-lg mb-1">
                🔒 This lead is frozen.
              </p>
              <p className="text-gray-600 text-sm">You cannot make changes.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start gap-6 flex-wrap mb-6">
          <div className="flex flex-col gap-1">
  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
    {editingClientNameId === lead._id ? (
      <>
        <input
          value={editedClientName}
          onChange={(e) => setEditedClientName(e.target.value)}
          className="border px-2 py-1 rounded text-base"
        />
        <button onClick={handleSave} className="text-green-600">Save</button>
        <button onClick={() => setEditingClientNameId(null)} className="text-red-500">Cancel</button>
      </>
    ) : (
      <>
        <span>{lead.leadDetails?.clientName || 'No Name'}</span>
        <FaEdit
          className="text-indigo-400 cursor-pointer hover:text-indigo-700"
          onClick={() => {
            setEditingClientNameId(lead._id);
            setEditedClientName(lead.leadDetails?.clientName || '');
          }}
        />
      </>
    )}
  </h2>

  {/* Company */}
  {editingCompanyNameId === lead._id ? (
  <div className="flex gap-2 items-center mt-1">
    <input
      value={editedCompanyName}
      onChange={(e) => setEditedCompanyName(e.target.value)}
      className="border px-2 py-1 rounded text-sm"
    />
    <button onClick={() => updateCompanyName(lead._id)} className="text-green-600 text-sm">
      Save
    </button>
    <button onClick={() => setEditingCompanyNameId(null)} className="text-red-500 text-sm">
      Cancel
    </button>
  </div>
) : (
  lead.leadDetails?.companyName && (
    <div
      className="text-sm text-indigo-700 font-medium cursor-pointer hover:underline"
      onClick={() => {
        setEditingCompanyNameId(lead._id);
        setEditedCompanyName(lead.leadDetails.companyName || '');
      }}
    >
      🏢 {lead.leadDetails.companyName}
    </div>
  )
)}

{/* Location */}
{editingLocationId === lead._id ? (
  <div className="flex gap-2 items-center mt-1">
    <input
      value={editedLocation}
      onChange={(e) => setEditedLocation(e.target.value)}
      className="border px-2 py-1 rounded text-sm"
    />
    <button
      onClick={() => updateLocation(lead._id)}
      className="text-green-600 text-sm"
    >
      Save
    </button>
    <button
      onClick={() => setEditingLocationId(null)}
      className="text-red-500 text-sm"
    >
      Cancel
    </button>
  </div>
) : (
  lead.leadDetails?.location && (
    <div
      className="text-sm text-blue-600 font-medium cursor-pointer hover:underline"
      onClick={() => {
        setEditingLocationId(lead._id);
        setEditedLocation(lead.leadDetails.location || '');
      }}
    >
      📍 {lead.leadDetails.location}
    </div>
  )
)}

 {/* Primary Contact - debug */}
{editingPrimaryContactId === lead._id ? (
  <div className="flex gap-2 items-center mt-1">
    <input
      type="text"
      value={editedPrimaryContact}
      onChange={(e) => setEditedPrimaryContact(e.target.value)}
      className="border px-2 py-1 rounded text-sm"
    />
    <button
      onClick={() => updatePrimaryContact(lead._id)}
      className="text-green-600 text-sm"
    >
      ✅ Save
    </button>
    <button
      onClick={() => setEditingPrimaryContactId(null)}
      className="text-red-500 text-sm"
    >
      ❌ Cancel
    </button>
  </div>
) : (
  <div
    onClick={() => {
      console.log("Clicked to edit contact", lead._id);
      setEditingPrimaryContactId(lead._id);
      setEditedPrimaryContact(lead.leadDetails.contact || '');
    }}
    className="cursor-pointer text-blue-600 hover:underline mt-1"
  >
    📞 <b>Primary:</b> {lead.leadDetails.contact || 'N/A'} (click to edit)
  </div>
)}

  {/* Additional contacts */}
  {Array.isArray(lead.leadDetails?.contacts) &&
    lead.leadDetails.contacts.map((c, idx) => (
      <div key={idx} className="flex items-center gap-2">
        📞 <span className="font-medium">{c.label}:</span> {c.number}
      </div>
    ))}

  {/* Add new contact input */}
  {newContactLeadId === lead._id ? (
    <div className="mt-2 flex flex-col gap-2">
      <input
        type="text"
        value={newContactNumber}
        onChange={(e) => setNewContactNumber(e.target.value)}
        placeholder="Enter 10-digit number"
        className="border rounded px-2 py-1 text-sm"
      />
      <input
        type="text"
        value={newContactLabel}
        onChange={(e) => setNewContactLabel(e.target.value)}
        placeholder="Label (e.g., Work, Alternate)"
        className="border rounded px-2 py-1 text-sm"
      />
      <div className="flex gap-3 mt-1">
        <button
          onClick={() => handleAddContact(lead._id)}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          ✅ Add
        </button>
        <button
          onClick={() => setNewContactLeadId(null)}
          className="text-red-500 text-sm"
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  ) : (
    <button
      onClick={() => setNewContactLeadId(lead._id)}
      className="text-blue-500 underline text-sm mt-1 w-fit"
    >
      ➕ Add Contact
    </button>
    
  )}
  <button
  onClick={() => handleDeleteLead(lead._id)}
  className="text-red-600 underline text-sm mt-2 w-fit"
>
  ❌ Delete this Lead
</button>

</div>



          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-end">

            <Link href="/EnquiryForm">
  <span className="bg-amber-700 text-white px-4 py-2 rounded-lg shadow cursor-pointer inline-block">
    📃 Enquiry Form
  </span>
</Link>

<button onClick={() => sendWhatsAppMessage(lead)} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow">
  📩 WhatsApp (Connected)
</button>


<button onClick={() => notSendWhatsAppMessage(lead)} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow">
  📩 WhatsApp (Not Connected)
</button>
 

            <button onClick={() => sendWhatsAppPdf(lead.leadDetails?.contact, lead.leadDetails?.clientName, 'gcb.pdf')} className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow">📄 PDF</button>
            <Link
            href="/gallery"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow inline-block"
            >
            🖼️ Photos
            </Link>
          </div>
        </div>

        {/* Email */}
        <div className="mb-4 text-sm text-gray-700">
          {editingEmailId === lead._id ? (
            <div className="flex gap-2 items-center">
              <input
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="border px-2 py-1 rounded"
              />
              <button onClick={handleEmailSave} className="text-green-600">Save</button>
              <button onClick={() => setEditingEmailId(null)} className="text-red-500">Cancel</button>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <span>{lead.leadDetails?.email || 'No email'}</span>
              <FaEdit
                className="text-indigo-400 cursor-pointer hover:text-indigo-700"
                onClick={() => {
                  setEditingEmailId(lead._id);
                  setEditedEmail(lead.leadDetails?.email || '');
                }}
              />
            </div>
          )}
        </div>

        {/* View Card */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              localStorage.setItem("selectedLead", JSON.stringify(lead));
              window.location.href = "/LeadDetails";
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow"
          >
            🗂️ View Lead Card
          </button>
        </div>
      </div>

      {/* Remarks Section */}
      <div className="mt-8 max-w-4xl mx-auto">
        <button
          onClick={() => setShowRemarksSection(prev => !prev)}
          className="block w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-2 rounded-full font-semibold mb-4"
        >
          {showRemarksSection ? 'Hide Remarks' : 'Show Remarks'}
        </button>

        {showRemarksSection && (
          <div className="bg-white p-6 rounded-2xl shadow border border-indigo-100">
            <textarea
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              placeholder="Type next action plan..."
              className="w-full p-3 border rounded-lg mb-4"
              rows={4}
            />
            <div className="flex gap-4 flex-wrap">
              <button onClick={handleSaveActionPlan} className="bg-indigo-500 text-white px-4 py-2 rounded-xl">💾 Save</button>
              <button onClick={() => setShowActionPlans(prev => !prev)} className="bg-gray-200 px-4 py-2 rounded-xl">
                {showActionPlans ? 'Hide Saved' : 'Show Saved'}
              </button>
            </div>

            {showActionPlans && (
              <div className="mt-4 space-y-2">
                {(savedActionPlansMap[lead._id] || []).map((plan, i) => (
                  <div key={i} className="bg-blue-50 p-2 rounded">{plan}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-center items-center gap-6 mt-10">
        <button
          onClick={goToPreviousLead}
          disabled={currentLeadIndex === 0}
          className="bg-gray-300 px-4 py-2 rounded-full text-sm flex items-center gap-1 disabled:opacity-50"
        >
          <FaArrowLeft /> Previous
        </button>
        <span className="text-sm font-semibold">
          Showing {currentLeadIndex + 1} of {filteredLeads.length}
        </span>
        <button
          onClick={goToNextLead}
          disabled={currentLeadIndex === filteredLeads.length - 1}
          className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-1 disabled:opacity-50"
        >
          Next <FaArrowRight />
        </button>
      </div>

      <div className="text-center text-xs text-gray-400 mt-2">
        End of Lead View
      </div>
    </div>
  );
};


export default LeadTable;