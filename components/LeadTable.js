import { useEffect, useState, useMemo, useRef } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';

const LeadTable = ({ leads, searchTerm }) => {
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const hasRestoredRef = useRef(false);

  // Filtered and sorted
  const filteredLeads = useMemo(() => {
    let result = leads || [];
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().replace(/\D/g, '');
      const termString = searchTerm.toLowerCase();
      result = leads.filter(lead => {
        const clientName = lead.leadDetails?.clientName?.toLowerCase() || '';
        if (clientName.includes(termString)) return true;
        const contacts = lead.leadDetails?.contacts || [];
        return contacts.some(c =>
          (c?.number || '').replace(/\D/g, '').includes(term)
        );
      });
    }
    // Sort by client name, fallback to _id
    return [...result].sort((a, b) =>
      (a.leadDetails?.clientName || a._id || '').toLowerCase().localeCompare(
        (b.leadDetails?.clientName || b._id || '').toLowerCase()
      )
    );
  }, [leads, searchTerm]);

  // This will restore ONCE when filteredLeads is first loaded/non-empty
  useEffect(() => {
    if (!hasRestoredRef.current && filteredLeads.length > 0) {
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
    // If you want to reset restoration when the list becomes empty (e.g., on logout), reset the flag:
    if (filteredLeads.length === 0) {
      hasRestoredRef.current = false;
    }
  }, [filteredLeads]);

  // Whenever the lead changes (e.g., via Next/Prev), update lastViewedLeadId
  const lead = filteredLeads[currentLeadIndex];
  useEffect(() => {
    if (lead) {
      localStorage.setItem('lastViewedLeadId', lead._id.toString());
    }
  }, [lead]);

  // Prev/Next
  const goToPreviousLead = () => {
    setCurrentLeadIndex(idx => Math.max(idx - 1, 0));
  };
  const goToNextLead = () => {
    setCurrentLeadIndex(idx => Math.min(idx + 1, filteredLeads.length - 1));
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
    </div>
  );
};

export default LeadTable;
