import dynamic from "next/dynamic";
import {motion} from "framer-motion";
import { useEffect, useState , useRef} from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import { toast } from 'react-toastify';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import {useRouter} from 'next/router';
import LifecycleToggle from '../components/LifecycleToggle';
import downloadLeadReport from '../components/downloadLeadReport'
import { FaEdit } from 'react-icons/fa';
import ShareSidebar from "../components/ShareSidebar";
const LeadDetails = () => { 
  const router=useRouter();
  const [lead, setLead] = useState(null);
  const [editingClientNameId, setEditingClientNameId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedConnection, setSelectedConnection] = useState('');
  const [editingCompanyNameId, setEditingCompanyNameId] = useState(null);
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [editingPrimaryContactId, setEditingPrimaryContactId] = useState(null);
  const [editedClientName, setEditedClientName] = useState('');
  const [newContactLeadId, setNewContactLeadId] = useState(null);
  const [editedCompanyName, setEditedCompanyName] = useState('');  
  const [editedLocation, setEditedLocation] = useState('');
  const [editingEmailId, setEditingEmailId] = useState(null);
  const [editedPrimaryContacts, setEditedPrimaryContacts] = useState([]);
  const [editedEmail, setEditedEmail] = useState('');
  const [followUp, setFollowUp] = useState({ date: '', notes: '' });
  const [allFollowUpSuggestions, setAllFollowUpSuggestions] = useState([]);
  const [followUpSuggestions , setFollowUpSuggestions ] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]); 
  const [showSuggestions, setShowSuggestions ] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [showFollowUps, setShowFollowUps] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [leadTimers, setLeadTimers] = useState({});
  const [timer, setTimer] = useState({ running: false, time: 0, startTime: null, intervalId: null });
  const intervalRefs = useRef({});
  const [noteInput, setNoteInput] = useState({ date: '', text: '' });
  const [addingNote, setAddingNote] = useState(false);
  const [leads,setLeads] = useState([]);
  const [timerLogs, setTimerLogs] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]); 
  const [newContactNumber, setNewContactNumber] = useState([]);
  const [newContact, setNewContact] = useState({ number: "", label: "" });
  const [savingContact, setSavingContact] = useState(false);
  const [newContactLabel, setNewContactLabel] = useState([]);
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [hasRestoredIndex, setHasRestoredIndex] = useState(false);
  const [contactPicker, setContactPicker] = useState({
    open: false,
    options: [],
    onSelect: null,  
    actionLabel: '',
  });
  const [editableFields, setEditableFields] = useState({
  clientName: '',
  email: '',
  companyName: '',
  location: '',
  contacts: [],
});
  const [isEditing , setIsEditing] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const isDeadLead = lead?.lifecycleStatus === 'dead';

  useEffect(() => {
  const fetchFollowUpSuggestions = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${BASE_URL}/api/leads/followups/suggestions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllFollowUpSuggestions(res.data.suggestions || []);
    } catch {
      setAllFollowUpSuggestions([]);
    }
  };
  fetchFollowUpSuggestions();
}, []);

  useEffect(() => {
  if (!lead || !lead._id) return;

  const start = localStorage.getItem(`timer_${lead._id}_start`);
  const elapsed = parseInt(localStorage.getItem(`timer_${lead._id}_elapsed`) || "0", 10);
  const paused = localStorage.getItem(`timer_${lead._id}_paused`) === '1';

  if (start && !paused) {
   const startTimestamp = parseInt(start, 10);
    setLeadTimers(prev => ({
      ...prev,
      [lead._id]: {
        time: Math.floor((Date.now() - startTimestamp) / 1000),
        running: true,
        paused: false,
        startTimestamp,
      },
    }));

    if (intervalRefs.current[lead._id]) clearInterval(intervalRefs.current[lead._id]);
    intervalRefs.current[lead._id] = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTimestamp) / 1000);
      setLeadTimers(prev2 => ({
        ...prev2,
        [lead._id]: {
          ...prev2[lead._id],
          time: elapsedSeconds,
          running: true,
          paused: false,
          startTimestamp,
        },
      }));
      localStorage.setItem(`timer_${lead._id}_elapsed`, elapsedSeconds);
    }, 1000);
  } else {
    setLeadTimers(prev => ({
      ...prev,
      [lead._id]: {
        time: elapsed,
        running: false,
        paused: !!paused,
        startTimestamp: null,
      },
    }));
    if (intervalRefs.current[lead._id]) {
      clearInterval(intervalRefs.current[lead._id]);
      intervalRefs.current[lead._id] = null;
    }
  }

  return () => {
    if (intervalRefs.current[lead._id]) {
      clearInterval(intervalRefs.current[lead._id]);
      intervalRefs.current[lead._id] = null;
    }
  };
}, [lead]);

  useEffect(() => {
  if (!lead || !lead._id) return;
  setActivityLoading(true);
  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/leads/${lead._id}/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivities(res.data.activities || []);
    } catch (err) {
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };
  fetchActivities();
}, [lead]);

useEffect(() => {
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setLoggedInUser(parsedUser);
      setLoggedInUserId(parsedUser._id);
    }
  }
}, []);

const initializeTimers = (leads) => {
  const timers = {};
  leads.forEach(lead => {
    timers[lead._id] = {
      time: 0,
      running: false,
      paused: false,
      intervalId: null,
    };
  });
  setLeadTimers(timers);
};


useEffect(() => {
  if (lead && lead._id) {
    const stored = localStorage.getItem(`timer_${lead._id}`);
    const storedTime = stored ? parseInt(stored, 10) : 0;

    setLeadTimers(prev => ({
      ...prev,
      [lead._id]: {
        ...(prev[lead._id] || {}),
        time: storedTime,
        running: false,
        paused: false,
      },
    }));
  }
}, [lead]);

const startTimer = (leadId) => {
  const prev = leadTimers[leadId] || {};
  const isResuming = prev.paused && prev.startTimestamp;

  let startTimestamp = Date.now();
  let elapsed = prev.time || 0;

  if (isResuming) {
    startTimestamp = Date.now() - elapsed * 1000;
  } else {
    elapsed = 0;
    startTimestamp = Date.now();
  }

  localStorage.setItem(`timer_${leadId}_start`, startTimestamp);
  localStorage.setItem(`timer_${leadId}_elapsed`, elapsed);

  if (intervalRefs.current[leadId]) clearInterval(intervalRefs.current[leadId]);
  intervalRefs.current[leadId] = setInterval(() => {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startTimestamp) / 1000) + elapsed;
    setLeadTimers(prev => ({
      ...prev,
      [leadId]: {
        time: elapsedSeconds,
        running: true,
        paused: false,
        startTimestamp,
      },
    }));
    localStorage.setItem(`timer_${leadId}_elapsed`, elapsedSeconds);
  }, 1000);

  setLeadTimers(prev => ({
    ...prev,
    [leadId]: {
      ...prev[leadId],
      running: true,
      paused: false,
      startTimestamp,
      time: elapsed,
    },
  }));
};

const pauseTimer = (leadId) => {
  if (intervalRefs.current[leadId]) {
    clearInterval(intervalRefs.current[leadId]);
    intervalRefs.current[leadId] = null;
  }
  const prev = leadTimers[leadId] || {};
  const now = Date.now();
  let elapsed = prev.time || 0;
  if (prev.startTimestamp) {
    elapsed = Math.floor((now - prev.startTimestamp) / 1000) + (prev.time || 0);
  }
  localStorage.setItem(`timer_${leadId}_paused`, '1');
  localStorage.setItem(`timer_${leadId}_elapsed`, elapsed);
  setLeadTimers(prev2 => ({
    ...prev2,
    [leadId]: {
      ...prev,
      running: false,
      paused: true,
      time: elapsed,
    },
  }));
};

const resumeTimer = (leadId) => {
  const prev = leadTimers[leadId] || {};
  const elapsed = parseInt(localStorage.getItem(`timer_${leadId}_elapsed`) || prev.time || 0, 10);
  const startTimestamp = Date.now() - elapsed * 1000;

  localStorage.setItem(`timer_${leadId}_start`, startTimestamp);
  localStorage.removeItem(`timer_${leadId}_paused`);

  if (intervalRefs.current[leadId]) clearInterval(intervalRefs.current[leadId]);
  intervalRefs.current[leadId] = setInterval(() => {
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startTimestamp) / 1000) + elapsed;
    setLeadTimers(prev2 => ({
      ...prev2,
      [leadId]: {
        ...prev2[leadId],
        time: elapsedSeconds,
        running: true,
        paused: false,
        startTimestamp,
      },
    }));
    localStorage.setItem(`timer_${leadId}_elapsed`, elapsedSeconds);
  }, 1000);

  setLeadTimers(prev2 => ({
    ...prev2,
    [leadId]: {
      ...prev2[leadId],
      running: true,
      paused: false,
      startTimestamp,
      time: elapsed,
    },
  }));
};

const stopTimer = async (leadId) => {
  if (intervalRefs.current[leadId]) {
    clearInterval(intervalRefs.current[leadId]);
    intervalRefs.current[leadId] = null;
  }
  const prev = leadTimers[leadId] || {};
  const duration = prev.time || 0;
  const startTime = prev.startTimestamp ? new Date(prev.startTimestamp).toISOString() : null;

  localStorage.removeItem(`timer_${leadId}_start`);
  localStorage.removeItem(`timer_${leadId}_elapsed`);
  localStorage.removeItem(`timer_${leadId}_paused`);
  setLeadTimers(prev => ({
    ...prev,
    [leadId]: {
      time: 0,
      running: false,
      paused: false,
      startTimestamp: null,
    },
  }));

  if (duration > 0 && startTime) {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/timer-logs/save`, {
        leadId,
        leadName: lead.leadDetails?.clientName || 'Unknown',
        stoppedByName: loggedInUser?.name || 'Unknown',
        duration,
        startTime,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchTimerLogs();
    } catch (err) {
      console.error('Failed to save timer log:', err);
    }
  }
};

const fetchTimerLogs = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Timer log token:', token); 
    if (!token) {
      setTimerLogs([]);
      return;
    }
    const res = await axios.get(`${BASE_URL}/api/timer-logs/${lead._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTimerLogs(res.data.logs || []);
  } catch (err) {
    setTimerLogs([]);
    console.error('Failed to fetch timer logs', err?.response?.data || err.message);
    if (err?.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
  }
};


useEffect(() => {
  if (lead && lead._id) fetchTimerLogs();
}, [lead]);



useEffect(() => {
  return () => {
    Object.values(intervalRefs.current).forEach(intervalId => {
      if (intervalId) clearInterval(intervalId);
    });
  };
}, []);



const handleAddNote = async () => {
  if (!noteInput.text.trim() || !noteInput.date) {
    toast.warning('Please enter both note and date');
    return;
  }

  const token = localStorage.getItem('token');
  try {
    setAddingNote(true);
    const res = await axios.post(
      `${BASE_URL}/api/leads/${lead._id}/notes`,
      {
        leadId: lead._id,
        text: noteInput.text,
        date: noteInput.date
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success('Note added');
    setNoteInput({ text: '', date: '' });
    const updatedLead = { ...lead, notes: res.data.notes };
    setLead(updatedLead);
    localStorage.setItem('selectedLead', JSON.stringify(updatedLead));
  } catch (err) {
    toast.error('Failed to add note');
    console.error(err);
  } finally {
    setAddingNote(false);
  }
};
 
const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
};


  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

const fetchLead = async (id) => {
  if (!id || id === 'undefined') {
    console.error("❌ Invalid lead ID");
    setLoadingLead(false);
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    toast.error("Session expired. Please login again.");
    router.push('/login');
    return;
  }

  setLoadingLead(true);
  try {
    const isDead = router.query.isDead === 'true';
    const url = isDead
      ? `${BASE_URL}/api/leads/${id}`
      : `${BASE_URL}/api/leads/${id}`;

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data?.lead;
    if (!data) {
      toast.error("Lead not found.");
      setLoadingLead(false);
      return;
    }

    setLead(data);
    setSelectedStatus(data.status || '');
    setSelectedConnection(data.connectionStatus || '');
    localStorage.setItem('selectedLead', JSON.stringify(data));

    setEditableFields({
      clientName: data.leadDetails?.clientName || '',
      email: data.leadDetails?.email || '',
      companyName: data.leadDetails?.companyName || '',
      location: data.leadDetails?.location || '',
      contacts: data.leadDetails?.contacts || [],
    });

  } catch (error) {
    console.error("❌ Error fetching lead:", error);
    toast.error(error.response?.data?.message || 'Failed to fetch lead');
  } finally {
    setLoadingLead(false);
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



const sendWhatsAppPhotos = (number, clientName = '', selectedImages) => {
  const origin = window.location.origin;
  const imageLinks = Array.from(selectedImages).map((id, idx) => `${origin}/images/${id}.jpg`);
  const imageText = imageLinks.map((link, idx) => `Image ${idx + 1}: ${link}`).join('\n');
  const text = `Dear ${clientName || 'Customer'},\n\nHere are your requested bus images:\n${imageText}`;
  const url = `https://wa.me/91${number}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
  copyToClipboard(text); 
};

useEffect(() => {
  const loadLead = async () => {
    const idFromRouter = router.query?.leadId;
    const storedLead = localStorage.getItem('selectedLead');
    const parsedLead = storedLead ? JSON.parse(storedLead) : null;
    const idFromStorage = parsedLead?._id;

    const finalId = idFromRouter || idFromStorage;

    if (!finalId || finalId === 'undefined') {
      console.warn("❌ No valid lead ID found");
      setLoadingLead(false);
      return;
    }

    await fetchLead(finalId);
  };

  if (router.isReady) {
    loadLead();
  }
}, [router.isReady, router.query.leadId]);

const [loadingLead, setLoadingLead] = useState(true);
 
  const handleAddFollowUp = async () => {
  const token = localStorage.getItem('token');
  if (!followUp.date || !followUp.notes) {
    toast.warning('Please fill out both date and notes');
    return;
  }

  try {

    await axios.post(
      `${BASE_URL}/api/leads/followup`,
      {
        leadId: lead._id,
        followUp,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success('Follow-up added');

    const res = await axios.get(`${BASE_URL}/api/leads/${lead._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFollowUp({ date: '', notes: '' });
    setLead(res.data.lead);
    localStorage.setItem('selectedLead', JSON.stringify(res.data));

  } catch (err) {
    toast.error('Failed to add follow-up');
    console.error(err);
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


  const handleStatusUpdate = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.put(`${BASE_URL}/api/leads/${lead._id}/status`, {
      status: selectedStatus,
    }, { headers: { Authorization: `Bearer ${token}` } });

    toast.success('Status updated');

    const updatedLead = { ...lead, status: selectedStatus };
    setLead(updatedLead);
    localStorage.setItem('selectedLead', JSON.stringify(updatedLead));

  } catch (err) {
    toast.error('Error updating status');
    console.error(err);
  }
};


 const handleConnectionUpdate = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.put(`${BASE_URL}/api/leads/${lead._id}/connection-status`, {
      connectionStatus: selectedConnection,
    }, { headers: { Authorization: `Bearer ${token}` } });

    toast.success('Connection updated');

    const updatedLead = { ...lead, connectionStatus: selectedConnection };
    setLead(updatedLead);
    localStorage.setItem('selectedLead', JSON.stringify(updatedLead));

  } catch (err) {
    toast.error('Error updating connection');
    console.error(err);
  }
};
const handleMarkAsDead = async () => {
  const token = localStorage.getItem('token'); 

  try {
    const response = await axios.put(`${BASE_URL}/api/leads/${lead._id}/mark-dead`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    toast.success('Lead marked as dead');
    router.push('/dead-leads'); 
  } catch (error) {
    console.error('Error marking as dead:', error);
    toast.error('Failed to mark lead as dead');
  }
};


  const handleForward = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${BASE_URL}/api/leads/forward`,
        {
          leadId: lead._id,
          userId: selectedUserId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Lead forwarded');
      fetchLead(lead._id);
    } catch (err) {
      toast.error('Forwarding failed');
      console.error(err);
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

const handleAddContact = async (leadId) => {
  const raw = (newContact.number || "").toString();
  const normalized = raw.replace(/\s+/g, "");
  const digits = normalized.replace(/\D/g, "");
  const label = newContact.label?.trim() || "Other";

  if (!digits) return alert("Phone number is required");
  if (digits.length < 10) return alert("Enter a valid phone number");

  try {
    setSavingContact(true);
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const { data: updated } = await axios.post(
      `${BASE_URL}/api/leads/${leadId}/add-contact`,
      { number: digits, label },
      { headers }
    );

    setLead((prev) => ({
      ...prev,
      leadDetails: {
        ...prev.leadDetails,
        contacts:
          updated.contacts || updated.leadDetails?.contacts || prev.leadDetails.contacts,
      },
    }));

    setNewContact({ number: "", label: "" });
    setNewContactLeadId(null);
    toast.success("Contact added ✅");
  } catch (e) {
    console.error(e);
    alert(e.response?.data?.message || e.message || "Failed to add contact");
  } finally {
    setSavingContact(false);
  }
};


const updatePrimaryContacts = async (leadId) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const cleaned = editedPrimaryContacts
      .map((c) => c.trim().replace(/\D/g, ''))
      .filter((c) => c.length > 0);

    const allValid = cleaned.every((num) => /^\d{10}$/.test(num));
    if (!allValid) {
      toast.warning('All contacts must be valid 10-digit numbers');
      return;
    }

    const payload = cleaned.map((number, idx) => ({
      number,
      label: 'Primary',
      isPrimary: idx === 0
    }));

    const res = await axios.put(
      `${BASE_URL}/api/leads/${leadId}/update-contacts`,
      { contacts: payload },
      { headers }
    );

    setLeads((prev) =>
      prev.map((lead) =>
        lead._id === leadId
          ? {
              ...lead,
              leadDetails: {
                ...lead.leadDetails,
                contacts: res.data.contacts 
              }
            }
          : lead
      )
    );

    toast.success('Contacts updated ✅');
    setEditingPrimaryContactId(null);
    setEditedPrimaryContacts([]);

  } catch (err) {
    toast.error('Failed to update contacts');
    console.error(err);
  }
};

const markPrimaryContact = async (leadId, contactId) => {
  try {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    await axios.put(
      `${BASE_URL}/api/leads/${leadId}/primary-contact`,
      { _id: contactId }, 
      { headers }
    );

    toast.success('Primary contact marked successfully ✅');
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Failed to mark primary contact');
  }
};


const handleEmailSave = async (leadId) => {
  const token = localStorage.getItem('token');
  if (!editedEmail.trim()) {
    toast.warning('Email cannot be empty');
    return;
  }

  try {
    const response = await axios.put(
      `${BASE_URL}/api/leads/${lead._id}/email`,
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


const handleSave = () => {
    updateClientName(editingClientNameId);
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
  const message = `Dear ${clientName}, 
Thank you for your time on the call today.
At Gobind Coach Builders, we’ve been crafting custom bus bodies – school, staff, and luxury coaches – for 30+ years with a skilled team you can rely on.

If you need designs, specs, or quotations, I’d be glad to assist.

🔗 Stay connected:
Instagram: https://www.instagram.com/gobindcoach/
Facebook: https://www.facebook.com/gcbuses
YouTube: https://www.youtube.com/@gobindcoachbuilderss

Best regards,
${creatorName}
Business Development Executive
📞 7888837540`;

  const encodedText = encodeURIComponent(message);

  const openInApp = confirm("Click OK to open in WhatsApp App\nClick Cancel to open in WhatsApp Web");

  const url = openInApp
    ? `https://wa.me/${phoneNumber}?text=${encodedText}`
    : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;

  copyToClipboard(message);
  window.open(url, '_blank');
};

const creatorName = lead?.createdBy?.name || "Our Team";



const notSendWhatsAppMessage = (lead) => {
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
  const message = `Dear ${clientName},
This is ${creatorName} from Gobind Coach Builders.
I tried reaching you for a quick call regarding your bus body requirements.

With 30+ years of expertise, we manufacture high-quality bus bodies – school, staff, AC luxury, and custom designs – built to match your business needs.

Let me know a convenient time to connect, or simply reply here for more details.

🔗 Connect with us:
Instagram: https://www.instagram.com/gobindcoach/
Facebook: https://www.facebook.com/gcbuses
YouTube: https://www.youtube.com/@gobindcoachbuilders

Best regards,
Akshat Mudgal
Business Development Executive
📞7888837540
`;

  const encodedText = encodeURIComponent(message);

  const openInApp = confirm("Click OK to open in WhatsApp App\nClick Cancel to open in WhatsApp Web");

  const url = openInApp
    ? `https://wa.me/${phoneNumber}?text=${encodedText}`
    : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;

  copyToClipboard(message);
  window.open(url, '_blank');
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
  window.open(url, '_blank');

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

const currentLead = filteredLeads[currentLeadIndex];
const isFrozenByCreator =
  currentLead?.createdBy?._id === loggedInUser?._id &&
  currentLead?.forwardedTo?.user?._id &&
  currentLead?.isFrozen;

  if (loadingLead) {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <motion.div
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      <p className="mt-4 text-blue-600 font-medium">Loading lead details...</p>
    </div>
  );
}

if (!lead) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center h-64"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-16 h-16 bg-red-100 text-red-500 flex items-center justify-center rounded-full"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        ⚠️
      </motion.div>
      <p className="mt-4 text-red-600 font-medium">No lead found</p>
    </motion.div>
  );
}

  return (  
  <ProtectedRoute>
    <Navbar />
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 flex items-start justify-center font-sans">
      {/* Background accents */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-200 rounded-full filter blur-3xl opacity-10" />
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-purple-200 rounded-full filter blur-3xl opacity-10" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-100 rounded-full filter blur-2xl opacity-10" />

      <Link href="/dashboard"></Link>

      <div className="relative z-10 bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-full max-w-3xl transition">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Lead Card Details</h2>

        {/* Last Edited Info */}
        {lead.lastEditedAt && (
          <div className="mb-3 text-sm text-gray-500 flex items-center gap-2">
            <b>Last Edited:</b>{' '}
            {new Date(lead.lastEditedAt).toLocaleString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        )}

        {lead.createdBy && (
          <div className="text-sm text-gray-500 mb-5">
            <b>Edited By:</b> {lead.createdBy.name} (<span>{lead.createdBy.email}</span>)
          </div>
        )}

        {/* Header Section */}
        <div className="flex justify-between items-start gap-6 flex-wrap mb-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              {/* Client Name Editable */}
              {editingClientNameId === lead._id ? (
                <>
                  <input
                    value={editedClientName}
                    onChange={(e) => setEditedClientName(e.target.value)}
                    className="border px-2 py-1 rounded text-base shadow-sm"
                  />
                  <button onClick={handleSave} className="text-green-600 font-medium hover:underline">Save</button>
                  <button onClick={() => setEditingClientNameId(null)} className="text-red-500 font-medium hover:underline">Cancel</button>
                </>
              ) : (
                <>
                  <span>{lead.leadDetails?.clientName || 'No Name'}</span>
                  <FaEdit
                    className="text-indigo-500 cursor-pointer hover:text-indigo-700"
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
                  className="border px-2 py-1 rounded text-sm shadow-sm"
                />
                <button onClick={() => updateCompanyName(lead._id)} className="text-green-600 text-sm hover:underline">Save</button>
                <button onClick={() => setEditingCompanyNameId(null)} className="text-red-500 text-sm hover:underline">Cancel</button>
              </div>
            ) : (
              lead.leadDetails?.companyName && (
                <div
                  className="text-sm text-indigo-600 font-medium cursor-pointer hover:underline"
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
                  className="border px-2 py-1 rounded text-sm shadow-sm"
                />
                <button onClick={() => updateLocation(lead._id)} className="text-green-600 text-sm hover:underline">Save</button>
                <button onClick={() => setEditingLocationId(null)} className="text-red-500 text-sm hover:underline">Cancel</button>
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

{/* Editable Contact Numbers */}
{editingPrimaryContactId === lead._id ? (
  <div className="flex flex-col gap-2 mt-1">
    {editedPrimaryContacts.map((contact, index) => (
      <div key={index} className="flex gap-2 items-center">
        <input
          type="text"
          value={contact}
          onChange={(e) => {
            const updated = [...editedPrimaryContacts];
            updated[index] = e.target.value;
            setEditedPrimaryContacts(updated);
          }}
          className="border px-2 py-1 rounded text-sm"
        />
        <button
          onClick={() => {
            const updated = editedPrimaryContacts.filter((_, i) => i !== index);
            setEditedPrimaryContacts(updated);
          }}
          className="text-red-500 text-xs"
        >
          🗑
        </button>
      </div>
    ))}
    <button
      onClick={() => setEditedPrimaryContacts([...editedPrimaryContacts, ''])}
      className="text-blue-600 text-xs mt-1"
    >
      ➕ Add Contact
    </button>

    <div className="flex gap-3 mt-2">
      <button
        onClick={() => updatePrimaryContacts(lead._id)}
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
  </div>
) : (
  <div
    onClick={() => {
      setEditingPrimaryContactId(lead._id);
      setEditedPrimaryContacts(
        lead.leadDetails.contacts?.map((c) => c.number) || []
      );
    }}
    className="cursor-pointer text-blue-600 hover:underline mt-1"
  >
    📞 <b>Contacts:</b>{' '}
    {lead.leadDetails.contacts?.map((c) => c.number).join(', ') || 'N/A'} (click to edit)
  </div>
)}

  {/* Add new contact input */}
  {newContactLeadId === lead._id ? (
  <div className="mt-2 flex flex-col gap-2">
    <input
      type="tel"
      inputMode="tel"
      value={newContact.number}
      onChange={(e) =>
        setNewContact((p) => ({ ...p, number: e.target.value }))
      }
      placeholder="Enter number (e.g., +91 9876543210)"
      className="border rounded px-2 py-1 text-sm"
    />
    <input
      type="text"
      value={newContact.label}
      onChange={(e) =>
        setNewContact((p) => ({ ...p, label: e.target.value }))
      }
      placeholder="Label (e.g., Work, Alternate)"
      className="border rounded px-2 py-1 text-sm"
    />
    <div className="flex gap-3 mt-1">
      <button
        onClick={() => handleAddContact(lead._id)}
        disabled={savingContact}
        className="bg-green-500 text-white px-3 py-1 rounded text-sm disabled:opacity-60"
      >
        {savingContact ? "Adding..." : "✅ Add"}
      </button>
      <button
        onClick={() => {
          setNewContactLeadId(null);
          setNewContact({ number: "", label: "" });
        }}
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


        <div className="text-sm text-gray-700 mt-3">Timer: {formatTime(leadTimers[lead._id]?.time || 0)}</div>
        <div className="flex gap-2 mt-2">
          <button onClick={() => startTimer(lead._id)} className="px-3 py-1 bg-green-500 text-white rounded">Start</button>
          <button onClick={() => pauseTimer(lead._id)} className="px-3 py-1 bg-yellow-400 text-white rounded">Pause</button>
          <button onClick={() => resumeTimer(lead._id)} className="px-3 py-1 bg-blue-500 text-white rounded">Resume</button>
          <button onClick={() => stopTimer(lead._id)} className="px-3 py-1 bg-red-600 text-white rounded">Stop</button>
        </div>
        <div className="bg-white p-4 rounded shadow max-w-xs">
  <h3 className="text-base font-semibold text-gray-700 mb-2">🕓 Timer Logs</h3>
  {timerLogs.length === 0 ? (
    <p className='text-sm text-gray-400'>No Logs yet</p>
  ) : (
    <ul>
      {timerLogs.map((log,idx) => (
        <li key={idx} className='border-b pb-1 text-xs'>
          <div>
            <b>Time:</b> {formatTime(log.duration)}
          </div>
          <div>
            <b>By:</b> {log.stoppedByName}
          </div>
          <div>
            <b>At:</b> {new Date(log.stoppedAt).toLocaleString()}
          </div> 
        </li>
      ))}
    </ul>
  )}
</div>

       
            {/* Connection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Connection</label>
        <select
          value={selectedConnection}
          onChange={(e) => setSelectedConnection(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-green-400"
        >
          <option value="">-- Select Connection --</option>
          <option value="Connected">Connected</option>
          <option value="Not Connected">Not Connected</option>
        </select>
        <button
          onClick={handleConnectionUpdate}
          className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded shadow-md font-semibold"
        >
          Save Connection
        </button>
      </div>

      {/* Status */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
        >
          <option value="">-- Select Status --</option>
          <option value="Hot">Hot</option>
          <option value="Warm">Warm</option>
          <option value="Cold">Cold</option>
        </select>
        <button
          onClick={handleStatusUpdate}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded shadow-md font-semibold"
        >
          Save Status
        </button>
      </div>

<div className="mb-8">
  <h3 className="text-xl font-semibold text-gray-800 mb-4">📝 Notes</h3>

  {/* Note Date Input */}
  <div className="mb-4">
    <label htmlFor="noteDate" className="block text-sm font-medium text-gray-700 mb-1">
      Note Date
    </label>
    <input
      id="noteDate"
      type="date"
      value={noteInput.date}
      onChange={(e) => setNoteInput({ ...noteInput, date: e.target.value })}
      className="w-full border px-3 py-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  </div>

  {/* Note Text Input */}
  <div className="mb-4">
    <label htmlFor="noteText" className="block text-sm font-medium text-gray-700 mb-1">
      Note Text
    </label>
    <textarea
      id="noteText"
      rows="3"
      value={noteInput.text}
      onChange={(e) => setNoteInput({ ...noteInput, text: e.target.value })}
      className="w-full border px-3 py-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      placeholder="Enter note details..."
    />
  </div>

  {/* Add Note Button */}
  <button
    onClick={handleAddNote}
    disabled={addingNote}
    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md shadow-md transition duration-150"
  >
    {addingNote ? 'Adding...' : '➕ Add Note'}
  </button>

  {/* Notes History Display */}
  {lead.notes && lead.notes.length > 0 && (
    <div className="mt-6 bg-white p-4 rounded-xl shadow border">
      <h4 className="text-base font-semibold text-gray-700 mb-3">🗂️ Notes History</h4>
      {lead.notes
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((note, idx) => (
          <div
            key={idx}
            className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="text-sm text-gray-600 mb-1">
              <span className="font-medium text-indigo-700">
                📅 {new Date(note.date).toLocaleDateString()}
              </span>
              {note.addedBy?.name && (
                <span className="ml-2 text-xs text-gray-500 italic">
                  by {note.addedBy.name}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-800">{note.text}</div>
          </div>
        ))}
    </div>
  )}
</div>


      {/* Follow-Up Section */}
      {/* Follow-Up Section */}
<div className='mb-8'>
  <label className='block text-sm font-semibold text-gray-700 mb-2'>Add Follow Up</label>
  <input
    type="date"
    value={followUp.date}
    onChange={(e) => setFollowUp({ ...followUp, date: e.target.value })}
    className='w-full border px-3 py-2 rounded mb-2 focus:ring-2 focus:ring-purple-300'
  />
  <div className='relative'>
    <textarea
      placeholder='Enter Follow Up'
      rows='3'
      value={followUp.notes}
      onChange={(e) => {
        const value = e.target.value;
        setFollowUp({ ...followUp, notes: value });
        if (value.length > 0) {
          const filtered = allFollowUpSuggestions
            .filter(
              (note) =>
                note &&
                note.toLowerCase().startsWith(value.toLowerCase()) &&
                note.toLowerCase() !== value.toLowerCase()
            )
            .slice(0, 5);
          setFilteredSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
        } else {
          setFilteredSuggestions([]);
          setShowSuggestions(false);
        }
      }}
      className='w-full border px-3 py-2 rounded focus:ring-2 focus:ring-purple-300'
      onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
      onFocus={() => {
        if (filteredSuggestions.length > 0) setShowSuggestions(true);
      }}
    />
    {showSuggestions && filteredSuggestions.length > 0 && (
      <ul className="absolute left-0 right-0 z-50 bg-white border border-gray-200 rounded mt-1 shadow max-h-40 overflow-y-auto">
        {filteredSuggestions.map((suggestion, idx) => (
          <li
            key={idx}
            className="px-3 py-2 cursor-pointer hover:bg-purple-100 text-sm"
            onMouseDown={() => {
              setFollowUp({ ...followUp, notes: suggestion });
              setShowSuggestions(false);
            }}
          >
            {suggestion}
          </li>
        ))}
      </ul>
    )}
  </div>

  <button
    onClick={handleAddFollowUp}
    className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-medium shadow-md transition"
  >
    Add Follow-Up
  </button>
</div>
      {/* Follow-Up Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowFollowUps(!showFollowUps)}
          className="text-sm text-blue-600 font-medium hover:underline"
        >
          {showFollowUps ? 'Hide Follow-Ups' : 'Show Follow-Ups'}
        </button>
      </div>

      {showFollowUps && (
        <div className="bg-white p-4 rounded-xl shadow border mb-6">
          <h3 className="text-base font-semibold text-gray-700 mb-4">Follow-Up History</h3>

          {/* Follow-ups by the assigned user */}
          {lead.forwardedTo?.user && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Remarks by {lead.forwardedTo.user.name} (Assigned user)
              </h4>
              {lead.remarksHistory?.filter(entry => entry.updatedBy?._id === lead.forwardedTo.user._id).length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  No remarks by {lead.forwardedTo.user.name}
                </p>
              ) : (
                lead.remarksHistory
                  .filter(entry => entry.updatedBy?._id === lead.forwardedTo.user._id)
                  .map((remark, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col gap-1 text-sm bg-white px-4 py-3 mb-2 rounded-lg shadow-sm border"
                    >
                      <span className="text-indigo-700 font-medium">{new Date(remark.date).toLocaleDateString()}</span>
                      <span className="text-gray-700">{remark.remarks}</span>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Follow-ups by the person who forwarded the lead (createdBy) */}
          {lead.createdBy && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                By {lead.createdBy.name} (Forwarded the Lead)
              </h4>
              {lead.followUps.filter(f => f.by?._id === lead.createdBy._id).length === 0 ? (
                <p className="text-xs text-gray-500 italic">
                  No follow-ups by {lead.createdBy.name}
                </p>
              ) : (
                lead.followUps
                  .filter(f => f.by?._id === lead.createdBy._id)
                  .map((fup, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 text-sm bg-white px-4 py-3 mb-2 rounded-lg shadow-sm border"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">
                          {fup.date?.split('T')[0] || 'No Date'}
                        </span>
                        <span className="text-gray-600 text-xs">{fup.notes}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      )}

{/* Visits & Meetings Section */}
<div className="mb-6">
  <h3 className="text-lg font-semibold text-gray-800 mb-2">
    Visits & Meetings
  </h3>
  {activityLoading ? (
    <div className="text-gray-500 text-sm">Loading activities...</div>
  ) : activities.length === 0 ? (
    <div className="text-gray-400 italic">No activities recorded for this lead.</div>
  ) : (
    <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
      <thead className="bg-gray-100 text-gray-700">
        <tr>
          <th className="px-3 py-2 text-left font-medium">Type</th>
          <th className="px-3 py-2 text-left font-medium">By</th>
          <th className="px-3 py-2 text-left font-medium">Date</th>
          <th className="px-3 py-2 text-left font-medium">Location</th>
          <th className="px-3 py-2 text-left font-medium">Outcome</th>
          <th className="px-3 py-2 text-left font-medium">Remarks</th>
        </tr>
      </thead>
      <tbody>
        {activities
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((act, idx) => (
            <tr key={idx} className="border-b last:border-b-0">
              <td className="px-3 py-2">{act.type === 'factory_visit' ? 'Factory Visit' : 'In-Person Meeting'}</td>
              <td className="px-3 py-2">{act.conductedBy?.name || '-'}</td>
              <td className="px-3 py-2">{act.date ? new Date(act.date).toLocaleDateString() : '-'}</td>
              <td className="px-3 py-2">{act.location || '-'}</td>
              <td className="px-3 py-2">{act.outcome || '-'}</td>
              <td className="px-3 py-2">{act.remarks || '-'}</td>
            </tr>
        ))}
      </tbody>
    </table>
  )}
</div>

{/* Forward Section */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">Forward Lead</label>
  <select
    value={selectedUserId}
    onChange={(e) => setSelectedUserId(e.target.value)}
    className="w-full border border-gray-300 px-3 py-2 rounded"
  >
    <option value="">-- Select User --</option>
    {users
      .filter(user => user._id !== loggedInUserId && user.role !== "admin")
      .map(user => (
        <option key={user._id} value={user._id}>
          {user.name}
        </option>
      ))}
  </select>

  <button
  className="mt-2 w-full bg-orange-500 text-white py-2 rounded"
  disabled={!selectedUserId}
  onClick={async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `${BASE_URL}/api/leads/forward`,
        { leadId: lead._id, userId: selectedUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let userName = "user";
      const user = users.find(u => u._id === selectedUserId);
      if (user) userName = user.name;

      toast.success(`Lead forwarded to ${userName}! Email notification sent.`);
      setSelectedUserId('');

      try {
        await fetchLead(lead._id); // separate try-catch in case refresh fails
      } catch (refreshErr) {
        console.warn("Lead forwarded, but failed to refresh:", refreshErr);
        toast.warning("Lead forwarded, but could not refresh details.");
      }

    } catch (err) {
      console.error("Forwarding error:", err);
      if (err.response && err.response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.clear();
        window.location.href = '/login';
      } else {
        toast.error("Forwarding failed");
      }
    }
  }}
>
  Forward Lead
</button>
</div>

{/* Share Buttons */}
<div className="w-full flex justify-end mb-6">
  <ShareSidebar
    lead={lead}
    sendWhatsAppMessage={sendWhatsAppMessage}
    notSendWhatsAppMessage={notSendWhatsAppMessage}
    sendWhatsAppPdf={sendWhatsAppPdf}
  />
</div>

{/* Contact Picker Modal */}
{contactPicker.open && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
    <div className="bg-white p-4 rounded shadow-md w-full max-w-xs">
      <div className="mb-3 font-semibold text-gray-700">
        Select number to {contactPicker.actionLabel}
      </div>
      {contactPicker.options.map((c, idx) => (
        <button
          key={idx}
          className="w-full text-left px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 mb-2"
          onClick={() => contactPicker.onSelect(c.number)}
        >
          {c.label}: {c.number}
        </button>
      ))}
      <button
        onClick={() => setContactPicker(prev => ({ ...prev, open: false }))}
        className="text-sm text-gray-400 hover:text-red-500"
      >
        Cancel
      </button>
    </div>
  </div>
)}

<button
  onClick={() => downloadLeadReport(lead, timerLogs, activities)}
  className="bg-indigo-700 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-800 transition mb-6"
>
  ⬇️ Download Full Lead Report
</button>


    </div>
  </div>
  </div>
  </div>
  </ProtectedRoute>
);

};

export default dynamic(() => Promise.resolve(LeadDetails), { ssr: false });
