// pages/lead-pdfs.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import BASE_URL from "../utils/api";

export default function LeadPdfsPage() {
  const router = useRouter();
  const { leadId } = router.query;

  const [pdfs, setPdfs] = useState([]);
  const [leadName, setLeadName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!leadId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Unauthorized. Please login again.");
      setLoading(false);
      return;
    }

    // ✅ Fetch PDFs
    axios
      .get(`${BASE_URL}/api/enquiry/all-pdfs/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setError("");
        setPdfs(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load PDFs"
        );
        setLoading(false);
      });

    // ✅ Fetch Lead Name
    axios
      .get(`${BASE_URL}/api/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setLeadName(res.data?.leadDetails?.clientName || res.data?.name || "");
      })
      .catch((err) => {
        console.error("Error fetching lead name:", err);
      });
  }, [leadId]);

  // Download function
  const handleDownload = async (pdf) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}${pdf.pdfUrl}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${pdf.enquiryId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Error downloading PDF:", err);
      alert("Failed to download PDF.");
    }
  };

  // ✅ Skeleton Loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">
          Loading Enquiry PDFs...
        </h1>
        <ul className="space-y-4">
          {[1, 2, 3].map((i) => (
            <li
              key={i}
              className="p-4 border rounded-lg bg-white shadow-sm animate-pulse"
            >
              <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-300 rounded w-28"></div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">
        Enquiry PDFs for Lead:{" "}
        <span className="text-indigo-600 break-all">
          {leadName || leadId}
        </span>
      </h1>

      {pdfs.length === 0 ? (
        <p>No PDFs found for this lead.</p>
      ) : (
        <ul className="space-y-4">
          {pdfs.map((pdf) => (
            <li
              key={pdf.enquiryId}
              className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-medium">Enquiry ID: {pdf.enquiryId}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(pdf.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDownload(pdf)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ⬇ Download PDF
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
