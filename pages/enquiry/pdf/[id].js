import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BASE_URL from '../../../utils/api';
import Link from 'next/link';
export default function PdfViewer() {
  const router = useRouter();
  const { id } = router.query;
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const fetchPDFs = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      if (id) {
        try {
          setLoading(true);
          setAuthError(false);
          const res = await fetch(`${BASE_URL}/api/enquiry/all-pdfs/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (res.status === 401 || res.status === 403) {
            setAuthError(true);
            setLoading(false);
            return;
          }

          const data = await res.json();
          if (Array.isArray(data)) {
            setPdfs(data);
          } else {
            setPdfs([]);
          }
        } catch (err) {
          setPdfs([]);
          console.error('Error loading PDFs:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPDFs();
  }, [id]);

  return (
    <div className="min-h-screen p-6 bg-white text-center">
      <h1 className="text-2xl font-bold mb-6">All Enquiry PDFs</h1>

      {loading && <p>Loading PDFs...</p>}

      {authError && (
        <div className="mb-6 text-red-600">
          <p>Unauthorized. Please <Link href="/login" className="underline text-blue-600">login</Link> to view your PDFs.</p>
        </div>
      )}

      {!loading && !authError && (
        pdfs.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            {pdfs.map((pdf) => (
              <div key={pdf.enquiryId} className="border p-4 rounded shadow-md text-left">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Enquiry ID: {pdf.enquiryId}
                </h2>
                <p className="text-sm text-gray-500">Created At: {new Date(pdf.createdAt).toLocaleString()}</p>

                <button
  onClick={async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Unauthorized. Please login again.');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}${pdf.pdfUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

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
  className="mt-4 bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
>
  Download PDF
</button>

              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No PDFs found for this lead.</p>
        )
      )}

      <Link href="/EnquiryForm">
        <button className="mt-8 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition">
          Go to enquiry form
        </button>
      </Link>
      <Link href="/dashboard">
        <button className="mt-8 px-4 py-2 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition mx-4">
          Go to Dashboard
        </button>
      </Link>
    </div>
  );
}
