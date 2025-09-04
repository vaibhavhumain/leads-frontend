import { useState } from "react";
import { FaFileExcel } from "react-icons/fa";
import BASE_URL from "../../utils/api";

export default function AnyWeekReportDownloader({ userId, userName }) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10) // default today
  );

  const downloadWeeklyReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const chosen = new Date(selectedDate);

      // calculate week range (Mon–Sun) based on selected date
      const day = chosen.getDay();
      const diffToMonday = chosen.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(chosen.setDate(diffToMonday));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const start = monday.toISOString().slice(0, 10);
      const end = sunday.toISOString().slice(0, 10);

      const res = await fetch(
        `${BASE_URL}/api/reports/user/${userId}?type=weekly&start=${start}&end=${end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to download");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${userName}-week-${start}-to-${end}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Weekly report download error:", err);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="border px-3 py-2 rounded shadow"
      />
      <button
        onClick={downloadWeeklyReport}
        className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow"
      >
        <FaFileExcel /> Download Weekly Report
      </button>
    </div>
  );
}
