import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BASE_URL from '../../../utils/api';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';

const isObjectId = (v) => /^[0-9a-fA-F]{24}$/.test(String(v || ''));

export default function ExcelViewer() {
  const router = useRouter();
  const { leadId } = router.query;

  const [excels, setExcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [paramError, setParamError] = useState('');

  useEffect(() => {
    if (!router.isReady || !leadId) return;

    const fetchExcels = async () => {
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

        const res = await fetch(`${BASE_URL}/api/enquiry/all-excels/${leadId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          setAuthError(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          setExcels([]);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setExcels(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading Excels:', err);
        setExcels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExcels();
  }, [router.isReady, leadId]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-6">All Enquiry Excels</h1>

        {loading && <p>Loading Excel files...</p>}

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
          excels.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
              {excels.map((excel) => (
                <div
                  key={excel.enquiryId}
                  className="border p-4 rounded shadow-md text-left"
                >
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    Enquiry ID: {excel.enquiryId}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Created At: {new Date(excel.createdAt).toLocaleString()}
                  </p>

                  <div className="flex gap-4 mt-4">
                    {/* Download Button */}
                    <button
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        try {
                          const response = await fetch(`${BASE_URL}${excel.excelUrl}`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          if (!response.ok) throw new Error('Failed to fetch Excel');

                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `${excel.enquiryId}.xlsx`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error('Download error:', err);
                          alert('Failed to download Excel.');
                        }
                      }}
                      className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
                    >
                      Download Excel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No Excels found for this lead.</p>
          )
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
