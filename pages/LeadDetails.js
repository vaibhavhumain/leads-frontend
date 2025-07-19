import { useEffect, useState , useRef} from 'react';
import axios from 'axios';
import BASE_URL from '../utils/api';
import { toast } from 'react-toastify';
import { 
  FaEye, 
  FaEyeSlash, 
  FaUserCircle,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaMapMarkerAlt,
  FaUserShield,
  FaStickyNote, } from 'react-icons/fa';
import { BsCalendarEvent } from 'react-icons/bs';
import Link from 'next/link';
import { FaArrowRight } from "react-icons/fa";
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import {useRouter} from 'next/router';
import LifecycleToggle from '../components/LifecycleToggle';
const LeadDetails = () => {
  const router=useRouter();
  const [lead, setLead] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedConnection, setSelectedConnection] = useState('');
  const [followUp, setFollowUp] = useState({ date: '', notes: '' });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [showFollowUps, setShowFollowUps] = useState(true);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [leadTimers, setLeadTimers] = useState({});
  const [timer, setTimer] = useState({ running: false, time: 0, startTime: null, intervalId: null });
  const intervalRefs = useRef({});
  const [noteInput, setNoteInput] = useState({ date: '', text: '' });
  const [addingNote, setAddingNote] = useState(false);
  const [contactPicker, setContactPicker] = useState({
    open: false,
    options: [],
    onSelect: null,  
    actionLabel: '',
  });
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const isDeadLead = lead?.lifecycleStatus === 'dead';

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
const startTimer = (leadId) => {
  // If timer running, do nothing
  if (intervalRefs.current[leadId]) return;

  intervalRefs.current[leadId] = setInterval(() => {
    setLeadTimers(prev => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        time: (prev[leadId]?.time || 0) + 1,
        running: true,
        paused: false,
      },
    }));
  }, 1000);

  setLeadTimers(prev => ({
    ...prev,
    [leadId]: {
      ...prev[leadId],
      running: true,
      paused: false,
    },
  }));
};

const pauseTimer = (leadId) => {
  if (intervalRefs.current[leadId]) {
    clearInterval(intervalRefs.current[leadId]);
    intervalRefs.current[leadId] = null;
  }
  setLeadTimers(prev => ({
    ...prev,
    [leadId]: {
      ...prev[leadId],
      running: false,
      paused: true,
    },
  }));
};

const resumeTimer = (leadId) => {
  if (intervalRefs.current[leadId]) return; // already running
  if (!leadTimers[leadId]?.paused) return; // only resume if paused

  intervalRefs.current[leadId] = setInterval(() => {
    setLeadTimers(prev => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        time: (prev[leadId]?.time || 0) + 1,
        running: true,
        paused: false,
      },
    }));
  }, 1000);

  setLeadTimers(prev => ({
    ...prev,
    [leadId]: {
      ...prev[leadId],
      running: true,
      paused: false,
    },
  }));
};


const stopTimer = async (leadId) => {
  if (intervalRefs.current[leadId]) {
    clearInterval(intervalRefs.current[leadId]);
    intervalRefs.current[leadId] = null;
  }

  // Get the current time spent on this lead's timer
  const duration = leadTimers[leadId]?.time || 0;

  setLeadTimers(prev => ({
    ...prev,
    [leadId]: {
      time: 0,
      running: false,
      paused: false,
    },
  }));

  if (duration > 0) {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${BASE_URL}/api/timer-logs/save`, {
        leadId,
        leadName: lead.leadDetails?.clientName || 'Unknown',
        stoppedByName: loggedInUser.name || 'Unknown',
        duration,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Optionally, notify success or refresh logs
      // e.g. toast.success('Timer log saved successfully');
    } catch (err) {
      console.error('Failed to save timer log:', err);
      // Optionally notify user about failure
    }
  }
};
// Cleanup on unmount:
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


const sendWhatsAppMessage = (number, clientName = '') => {
  const text = `Dear ${clientName || 'Customer'}, It was a pleasure speaking with you today! Thank you for considering Gobind Coach Builders for your bus body requirements. We're excited about the opportunity to bring your vision to life with our durable designs and unmatched craftsmanship.`;
  const url = `https://wa.me/91${number}?text=${encodeURIComponent(text)}`;
  console.log('WA URL:', url);
  window.open(url, '_blank');
  copyToClipboard(text); 
};

const sendWhatsAppPdf = (number, clientName = '', pdfFileName) => {
  const origin = window.location.origin;
  const pdfUrl = `${origin}/${pdfFileName}`;
  const text = `Dear ${clientName || 'Customer'},\n\nPlease find the PDF here:\n${pdfUrl}`;
  const url = `https://wa.me/91${number}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
  copyToClipboard(text); 
};


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
    // Add follow-up
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

  if (loadingLead) return <p>Loading lead...</p>;
  if (!lead) return  <p>No lead found</p>


  return (
    <ProtectedRoute>
       <Navbar />
    <div className="relative min-h-screen w-full bg-gray-50 py-12 px-4 flex items-start justify-center overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-80 h-80 bg-pink-200 rounded-full filter blur-3xl opacity-20" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-red-100 rounded-full filter blur-2xl opacity-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-5" />

      <Link href="/dashboard"></Link>

      <div className="relative z-10 bg-white p-8 rounded-xl shadow-md border border-gray-200 w-full max-w-2xl transition">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Lead Card Details</h2>

        <div className="text-sm text-gray-700 space-y-2 mb-6">
          <p><strong>Client:</strong> {lead.leadDetails?.clientName || 'N/A'}</p>
          {lead.leadDetails?.contacts && lead.leadDetails.contacts.length > 0 ? (
            <p>
              <strong>Contact:</strong>{' '}
              {lead.leadDetails.contacts.map((c, idx) => (
                <span key={idx} className="mr-2">
                  {c.number} <span className="text-xs text-gray-500">({c.label || 'Other'})</span>
                </span>
              ))}
            </p>
          ) : (
            <p><strong>Contact:</strong> {lead.leadDetails?.contact || 'N/A'}</p>
          )}
          <p><strong>Email:</strong> {lead.leadDetails?.email || 'N/A'}</p>
          <p><strong>Company:</strong> {lead.leadDetails?.companyName || 'N/A'}</p>
          <p><strong>Location:</strong> {lead.leadDetails?.location || 'N/A'}</p>
          <p><strong>Created By:</strong> {lead.createdBy?.name || 'N/A'}</p>
        </div>

        <div className="text-sm text-gray-700 mt-3">Timer: {formatTime(leadTimers[lead._id]?.time || 0)}</div>
        <div className="flex gap-2 mt-2">
          <button onClick={() => startTimer(lead._id)} className="px-3 py-1 bg-green-500 text-white rounded">Start</button>
          <button onClick={() => pauseTimer(lead._id)} className="px-3 py-1 bg-yellow-400 text-white rounded">Pause</button>
          <button onClick={() => resumeTimer(lead._id)} className="px-3 py-1 bg-blue-500 text-white rounded">Resume</button>
          <button onClick={() => stopTimer(lead._id)} className="px-3 py-1 bg-red-600 text-white rounded">Stop</button>
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

      <LifecycleToggle lead={lead} />

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

{!isDeadLead && (
  <button
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
    onClick={handleMarkAsDead}
  >
    Mark Lead as Dead
  </button>
)}

      {/* Follow-Up Section */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Add Follow-Up</label>
        <input
          type="date"
          value={followUp.date}
          onChange={(e) => setFollowUp({ ...followUp, date: e.target.value })}
          className="w-full border px-3 py-2 rounded mb-2 focus:ring-2 focus:ring-purple-300"
        />
        <textarea
          placeholder="Enter follow-up"
          rows="3"
          value={followUp.notes}
          onChange={(e) => setFollowUp({ ...followUp, notes: e.target.value })}
          className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-purple-300"
        />
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
<div className="flex flex-col gap-3 mb-6 max-w-xs">
  <button
    onClick={() => {
      const validContacts = (lead.leadDetails?.contacts || [])
        .filter(c => c.number)
        .map(c => ({ number: c.number, label: c.label })) || [];

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
          onSelect: (number) => {
            sendWhatsAppMessage(number, lead.leadDetails?.clientName || '');
            setContactPicker(prev => ({ ...prev, open: false }));
          },
          actionLabel: "Send WhatsApp Message",
        });
      }
    }}
    className="w-full bg-green-500 text-white py-2 rounded"
  >
    Send WhatsApp
  </button>

  <button
    onClick={() => {
      const validContacts = (lead.leadDetails?.contacts || [])
        .filter(c => c.number)
        .map(c => ({ number: c.number, label: c.label })) || [];

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
          onSelect: (number) => {
            sendWhatsAppPdf(number, lead.leadDetails?.clientName || '', 'gcb.pdf');
            setContactPicker(prev => ({ ...prev, open: false }));
          },
          actionLabel: "Send PDF",
        });
      }
    }}
    className="w-full bg-yellow-500 text-white py-2 rounded"
  >
    Send PDF
  </button>

  <Link href="/gallery" passHref legacyBehavior>
    <a>
      <button className="w-full bg-blue-500 text-white py-2 rounded">
        View Photos
      </button>
    </a>
  </Link>
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


    </div>
  </div>
  </ProtectedRoute>
);
};

export default LeadDetails;

