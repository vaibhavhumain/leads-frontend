"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import BASE_URL from "../utils/api";

export default function LeadExcelsPage() {
  const router = useRouter();
  const { leadId } = router.query;

  const [excels, setExcels] = useState([]);
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

    axios
      .get(`${BASE_URL}/api/enquiry/all-excels/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setError("");
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        // show all final excels, not just one
        setExcels(sorted.length > 0 ? [sorted[0]] : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load Excels"
        );
        setLoading(false);
      });

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

  const handleDownload = async (excel) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}${excel.excelUrl}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${excel.enquiryId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Error downloading Excel:", err);
      alert("Failed to download Excel.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-700">
          Loading Enquiry Excels...
        </h1>
        <ul className="space-y-4">
          {[1].map((i) => (
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
        Final Enquiry Excels for Lead:{" "}
        <span className="text-indigo-600 break-all">
          {leadName || leadId}
        </span>
      </h1>

      {excels.length === 0 ? (
        <p>No final Excel found for this lead.</p>
      ) : (
        <ul className="space-y-4">
          {excels.map((excel) => (
            <li
              key={excel.enquiryId}
              className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="font-medium">Enquiry ID: {excel.enquiryId}</p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(excel.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDownload(excel)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ⬇ Download Excel
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
