import React, { useState } from "react";
import { subDays, format } from "date-fns";
import downloadWeeklyLeadReport from "./downloadWeeklyLeadReport";

const PreviousDayReportDownloader = ({ userId, userName }) => {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(format(subDays(new Date(), 1), "yyyy-MM-dd")); // default to yesterday

  const handleDownload = async () => {
    setLoading(true);
    try {
      await downloadWeeklyLeadReport(date, date, userId);
    } catch (err) {
      console.error("Failed to download previous day report:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 shadow-sm">
      <div className="mb-2 text-sm font-semibold text-yellow-800 flex items-center justify-between">
        <span>📅 Previous Day Report</span>
        <span className="text-xs text-gray-500 font-normal">({userName})</span>
      </div>
      <input
        type="date"
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
        value={date}
        max={format(subDays(new Date(), 0), "yyyy-MM-dd")}
        onChange={(e) => setDate(e.target.value)}
      />
      <button
        onClick={handleDownload}
        disabled={loading}
        className={`w-full text-white text-sm font-medium px-4 py-2 rounded transition shadow 
          ${loading ? "bg-yellow-300 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"}`}
      >
        {loading ? "Generating..." : `Download Report for ${date}`}
      </button>
    </div>
  );
};

export default PreviousDayReportDownloader;
