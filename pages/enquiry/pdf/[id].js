import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BASE_URL from '../../../utils/api';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';

const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(String(v || ''));

export default function PdfViewer() {
  const router = useRouter();
  const { leadId } = router.query;

  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [paramError, setParamError] = useState('');
  const [viewPdfUrl, setViewPdfUrl] = useState(null);

  useEffect(() => {
    if (!router.isReady || !leadId) return;

    const fetchPDFs = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      if (!token) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      if (!isObjectId(leadId)) {
        setParamError('Invalid leadId provided.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setAuthError(false);
        setParamError('');

        const res = await fetch(`${BASE_URL}/api/enquiry/all-pdfs/${leadId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          setAuthError(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setPdfs([]);
          setLoading(false);
          return;
        }

        const text = await res.text();
console.log("PDF API raw response:", text);
let data = [];
try {
  data = JSON.parse(text);
} catch (e) {
  console.error("Failed to parse JSON:", e);
}
setPdfs(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error('Error loading PDFs:', err);
        setPdfs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPDFs();
  }, [router.isReady, leadId]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-6">All Enquiry PDFs</h1>

        {loading && <p>Loading PDFs...</p>}

        {!loading && authError && (
          <div className="mb-6 text-red-600">
            Unauthorized. Please{' '}
            <Link href="/login" className="underline text-blue-600">login</Link>
          </div>
        )}

        {!loading && !authError && paramError && (
          <div className="mb-6 text-red-600">{paramError}</div>
        )}

        {!loading && !authError && !paramError && (
          pdfs.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
              {pdfs.map((pdf) => (
                <div
                  key={pdf.enquiryId}
                  className="border p-4 rounded shadow-md text-left"
                >
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Enquiry ID: {pdf.enquiryId}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Created At: {new Date(pdf.createdAt).toLocaleString()}
                  </p>

                  <div className="flex gap-4 mt-4">
                    {/* View Button */}
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        try {
                          const response = await fetch(`${BASE_URL}${pdf.pdfUrl}`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (!response.ok) throw new Error('Failed to fetch PDF');

                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          setViewPdfUrl(url);
                        } catch (err) {
                          console.error('View error:', err);
                          alert('Failed to load PDF.');
                        }
                      }}
                      className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
                    >
                      View PDF
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        try {
                          const response = await fetch(`${BASE_URL}${pdf.pdfUrl}`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (!response.ok) throw new Error('Failed to fetch PDF');

                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `${pdf.enquiryId}.pdf`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error('Download error:', err);
                          alert('Failed to download PDF.');
                        }
                      }}
                      className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
                    >
                      Download PDF 
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No PDFs found for this lead.</p>
          )
        )}

        {/* Inline Preview Section */}
        {viewPdfUrl && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Preview</h2>
            <iframe
              src={viewPdfUrl}
              width="100%"
              height="600px"
              className="border rounded"
            ></iframe>
            <div className="mt-2">
              <button
                onClick={() => setViewPdfUrl(null)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <Link href={`/EnquiryForm?leadId=${leadId}`}>
            <button className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition">
              Go to enquiry form
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition">
              Go to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
