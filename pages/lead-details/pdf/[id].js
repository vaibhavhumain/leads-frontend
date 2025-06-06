import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function PdfViewer() {
  const router = useRouter();
  const { id } = router.query;
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    if (id) {
      setPdfUrl(`https://your-backend.onrender.com/api/enquiry/pdf/${id}`);
    }
  }, [id]);

  return (
    <div className="min-h-screen p-6 bg-white text-center">
      <h1 className="text-2xl font-bold mb-4">Enquiry PDF</h1>
      {pdfUrl ? (
        <>
          <iframe
            src={pdfUrl}
            width="100%"
            height="700px"
            className="rounded border shadow max-w-5xl mx-auto"
          />
          <a
            href={pdfUrl}
            download
            className="mt-4 inline-block bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
          >
            Download PDF
          </a>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
