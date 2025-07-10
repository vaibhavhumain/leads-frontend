import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BASE_URL from '../../utils/api';

export default function ProposalPage() {
  const router = useRouter();
  const { leadId } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enquiryId, setEnquiryId] = useState('');

  // 🔁 Generate Proposal when page loads
  useEffect(() => {
    if (!router.isReady || !leadId) return;

    const generateProposal = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token missing');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/proposal/generate/${leadId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to generate proposal');
        } else {
          setEnquiryId(data.enquiryId); // ✅ Save enquiryId for download
        }
      } catch (err) {
        console.error('Error generating proposal:', err);
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    generateProposal();
  }, [router.isReady, leadId]);

  // 📥 Actual Download Function (you asked about)
  const downloadProposalPdf = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Token missing!');

    const response = await fetch(`${BASE_URL}/api/proposal/download/${enquiryId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Proposal-${enquiryId}.pdf`;
    a.click();
  };

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-6">Proposal PDF</h1>

      {loading && <p>Generating proposal PDF...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <button
          onClick={downloadProposalPdf}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Download Proposal PDF
        </button>
      )}
    </div>
  );
}
