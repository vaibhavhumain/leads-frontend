import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import BASE_URL from '../../../utils/api';
import Link from 'next/link';
export default function PdfViewer() {
  const router = useRouter();
  const { id } = router.query;
  const [pdfs, setPdfs] = useState([]);

  useEffect(() => {
    if (id) {
      fetch(`${BASE_URL}/api/enquiry/all-pdfs/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setPdfs(data);
          }
        })
        .catch((err) => console.error('Error loading PDFs:', err));
    }
  }, [id]);

  return (
    <div className="min-h-screen p-6 bg-white text-center">
      <h1 className="text-2xl font-bold mb-6">All Enquiry PDFs</h1>

      {pdfs.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          {pdfs.map((pdf) => (
            <div key={pdf.enquiryId} className="border p-4 rounded shadow-md text-left">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Enquiry ID: {pdf.enquiryId}
              </h2>
              <p className="text-sm text-gray-500">Created At: {new Date(pdf.createdAt).toLocaleString()}</p>

              <button
                onClick={() => {
                  const downloadUrl = `${BASE_URL}${pdf.pdfUrl}`;
                  const link = document.createElement('a');
                  link.href = downloadUrl;
                  link.download = `${pdf.enquiryId}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
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
      )}
      <Link href="/EnquiryForm">
      <button>Go to enquiry form</button>
      </Link>
    </div>
  );
}
