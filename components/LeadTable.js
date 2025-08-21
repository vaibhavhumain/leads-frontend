import { useEffect, useState, useMemo, useRef } from 'react';
import { useCallback } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import LifecycleToggle from './LifecycleToggle';
import DedupeButton from './DedupeButton';
import DeleteMyLeadsButton from './DeleteMyLeadsButton';
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
  if (!hasRestoredRef.current && filteredLeads.length > 0) {
    const savedLeadId = localStorage.getItem('lastViewedLeadId');
    const savedLeadIndex = localStorage.getItem('lastViewedLeadIndex');

    if (savedLeadIndex) {
      const index = parseInt(savedLeadIndex, 10);
      if (!isNaN(index) && index >= 0 && index < filteredLeads.length) {
        setCurrentLeadIndex(index);
      } else {
        setCurrentLeadIndex(0);
      }
    } else if (savedLeadId) {
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
    localStorage.setItem('lastViewedLeadIndex', currentLeadIndex.toString());
  }
}, [lead, currentLeadIndex]);


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

    const asNumber = parseInt(input);
    if (!isNaN(asNumber) && asNumber >= 1 && asNumber <= filteredLeads.length) {
      setCurrentLeadIndex(asNumber - 1);
      wasManuallyShiftedRef.current = true;
      return;
    }

    const nameMatch = filteredLeads.findIndex(lead =>
      lead.leadDetails?.clientName?.toLowerCase().includes(input)
    );
    if (nameMatch !== -1) {
      setCurrentLeadIndex(nameMatch);
      wasManuallyShiftedRef.current = true;
      return;
    }

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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 bg-[#e9f0ff] min-h-screen font-sans">
      <div className='mb-4 flex flex-col sm:flex-row justify-center items-center gap-3'>
        <input
          type="text"
          placeholder="Go to lead by number, name or contact"
          className='px-4 py-2 border rounded w-full sm:w-72 text-sm'
          onChange={(e) => setJumpNumber(e.target.value)}
          value={jumpNumber}
        />
        <button
          onClick={handleJump}
          className='bg-blue-600 text-white px-4 py-2 rounded text-sm w-full sm:w-auto'
        >
          Go
        </button>
        <DedupeButton
        createdByOnly={true}
        onDeleted={() => {
          if(typeof window !== 'undefined') window.location.reload();
        }}
        />
        <DeleteMyLeadsButton/>
      </div>
      

      <div className="bg-white w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 rounded-2xl shadow-lg">
        <div className="flex flex-col gap-2 mb-6">
          <h2 className="text-xl font-bold text-gray-800 break-words">
            {lead.leadDetails?.clientName || 'No Name'}
          </h2>
          {lead.leadDetails?.companyName && (
            <div className="text-sm text-indigo-700 font-medium break-words">
              🏢 {lead.leadDetails.companyName}
            </div>
          )}
          {lead.leadDetails?.location && (
            <div className="text-sm text-blue-600 font-medium break-words">
              📍 {lead.leadDetails.location}
            </div>
          )}
          {lead.leadDetails?.contacts?.length > 0 && (
            <div className="text-sm text-blue-600 mt-1 break-words">
              📞 <b>Contacts:</b> {lead.leadDetails.contacts.map(c => c.number).join(', ')}
            </div>
          )}
          {lead.leadDetails?.email && (
            <div className="text-sm text-gray-700 mt-1 break-words">
              📧 {lead.leadDetails.email}
            </div>
          )}
          {/* Enquiry Form */}
    <Link
      href={{
        pathname: '/EnquiryForm',
        query: { leadId: lead._id },
      }}
      passHref
      legacyBehavior
    >
      <a className="bg-amber-700 text-white px-4 py-2 rounded-lg shadow cursor-pointer hover:bg-amber-800 transition w-50 my-4">
        📃 Take Enquiry 
      </a>
    </Link>
        </div>
      </div>

      <Link href={`/LeadDetails?leadId=${lead._id}`}>
        <button className="text-lg font-semibold text-white mb-4 mt-4 bg-blue-500 px-6 py-2 rounded-xl shadow hover:bg-blue-600 transition w-full sm:w-auto">
          View Lead Details
        </button>
      </Link>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 mt-10 px-4">
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
      <div className='mt-8 flex flex-col sm:flex-row justify-center items-center gap-y-2 sm:gap-x-4'>
      <LifecycleToggle lead={lead} onDead={handleDeadLead} />
      </div>
    </div>
  );
};

export default LeadTable;
