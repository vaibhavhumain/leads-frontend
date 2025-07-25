import { useEffect, useState, useMemo, useRef } from 'react';
import { useCallback } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import LifecycleToggle from './LifecycleToggle';

const LeadTable = ({ leads, searchTerm }) => {
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [jumpNumber, setJumpNumber] = useState('');
  const [deadLeadId, setDeadLeadId] = useState(null);
  const hasRestoredRef = useRef(false);
  const wasManuallyShiftedRef = useRef(false);

  const filteredLeads = useMemo(() => {
    let result = leads || [];

    if (deadLeadId) {
      result = result.filter(l => l._id !== deadLeadId);
    }

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().replace(/\D/g, '');
      const termString = searchTerm.toLowerCase();
      result = result.filter(lead => {
        const clientName = lead.leadDetails?.clientName?.toLowerCase() || '';
        if (clientName.includes(termString)) return true;
        const contacts = lead.leadDetails?.contacts || [];
        return contacts.some(c =>
          (c?.number || '').replace(/\D/g, '').includes(term)
        );
      });
    }

    return result;
  }, [leads, searchTerm, deadLeadId]);

  useEffect(() => {
    if (!hasRestoredRef.current && !wasManuallyShiftedRef.current && filteredLeads.length > 0) {
      const savedLeadId = localStorage.getItem('lastViewedLeadId');
      if (savedLeadId) {
        const foundIndex = filteredLeads.findIndex(
          l => l._id?.toString() === savedLeadId.toString()
        );
        setCurrentLeadIndex(foundIndex !== -1 ? foundIndex : 0);
      } else {
        setCurrentLeadIndex(0);
      }
      hasRestoredRef.current = true;
    }

    if (filteredLeads.length === 0) {
      hasRestoredRef.current = false;
      wasManuallyShiftedRef.current = false;
    }
  }, [filteredLeads]);

  const lead = filteredLeads[currentLeadIndex];

  useEffect(() => {
    if (lead) {
      localStorage.setItem('lastViewedLeadId', lead._id.toString());
    }
  }, [lead]);

  const goToPreviousLead = () => {
    setCurrentLeadIndex(idx => Math.max(idx - 1, 0));
  };

  const goToNextLead = () => {
    setCurrentLeadIndex(idx => Math.min(idx + 1, filteredLeads.length - 1));
  };

  const handleDeadLead = useCallback((deadId) => {
    const isLast = currentLeadIndex === filteredLeads.length - 1;
    const nextIndex = isLast ? currentLeadIndex - 1 : currentLeadIndex;
    setCurrentLeadIndex(Math.max(nextIndex, 0));
    setDeadLeadId(deadId);
    wasManuallyShiftedRef.current = true;
  }, [currentLeadIndex, filteredLeads.length]);

  const handleJump = () => {
    const input = jumpNumber.trim().toLowerCase();

    // Jump by number (1-based index)
    const asNumber = parseInt(input);
    if (!isNaN(asNumber) && asNumber >= 1 && asNumber <= filteredLeads.length) {
      setCurrentLeadIndex(asNumber - 1);
      wasManuallyShiftedRef.current = true;
      return;
    }

    // Jump by client name
    const nameMatch = filteredLeads.findIndex(lead =>
      lead.leadDetails?.clientName?.toLowerCase().includes(input)
    );
    if (nameMatch !== -1) {
      setCurrentLeadIndex(nameMatch);
      wasManuallyShiftedRef.current = true;
      return;
    }

    // Jump by contact number (supports partial match)
    const contactMatch = filteredLeads.findIndex(lead =>
      lead.leadDetails?.contacts?.some(c =>
        c?.number?.replace(/\D/g, '').includes(input.replace(/\D/g, ''))
      )
    );
    if (contactMatch !== -1) {
      setCurrentLeadIndex(contactMatch);
      wasManuallyShiftedRef.current = true;
      return;
    }

    alert('No matching lead found by number, name or contact');
  };

  if (!lead) {
    return (
      <div className="w-full px-4 py-8 min-h-screen flex items-center justify-center text-gray-500">
        No lead found.
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 bg-[#e9f0ff] min-h-screen font-sans">
      <div className='mb-4 flex justify-center items-center gap-3'>
        <input
          type="text"
          placeholder="Go to lead by number, name or contact"
          className='px-4 py-2 border rounded w-72 text-sm'
          onChange={(e) => setJumpNumber(e.target.value)}
          value={jumpNumber}
        />
        <button
          onClick={handleJump}
          className='bg-blue-600 text-white px-4 py-2 rounded text-sm'
        >
          Go
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-6xl mx-auto">
        <div className="flex flex-col gap-2 mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {lead.leadDetails?.clientName || 'No Name'}
          </h2>
          {lead.leadDetails?.companyName && (
            <div className="text-sm text-indigo-700 font-medium">
              🏢 {lead.leadDetails.companyName}
            </div>
          )}
          {lead.leadDetails?.location && (
            <div className="text-sm text-blue-600 font-medium">
              📍 {lead.leadDetails.location}
            </div>
          )}
          {lead.leadDetails?.contacts?.length > 0 && (
            <div className="text-sm text-blue-600 mt-1">
              📞 <b>Contacts:</b> {lead.leadDetails.contacts.map(c => c.number).join(', ')}
            </div>
          )}
          {lead.leadDetails?.email && (
            <div className="text-sm text-gray-700 mt-1">
              📧 {lead.leadDetails.email}
            </div>
          )}
        </div>
      </div>

      <Link href={`/LeadDetails?leadId=${lead._id}`}>
        <button className="text-lg font-semibold text-white mb-4 mt-4 bg-blue-500 px-6 py-2 rounded-xl shadow hover:bg-blue-600 transition">
          View Lead Details
        </button>
      </Link>

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

      <LifecycleToggle lead={lead} onDead={handleDeadLead} />
    </div>
  );
};

export default LeadTable;
