import { useState } from "react";
import { FaFileExcel } from "react-icons/fa";
import BASE_URL from "../../utils/api";

export default function AnyMonthReportDownloader({ userId, userName }) {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  const downloadMonthlyReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const [year, month] = selectedMonth.split("-").map(Number);

      const start = new Date(year, month - 1, 1).toISOString().slice(0, 10);
      const end = new Date(year, month, 0).toISOString().slice(0, 10);

      const res = await fetch(
        `${BASE_URL}/api/reports/user/${userId}?type=monthly&start=${start}&end=${end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to download");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${userName}-month-${selectedMonth}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Monthly report download error:", err);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="month"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="border px-3 py-2 rounded shadow"
      />
      <button
        onClick={downloadMonthlyReport}
        className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow"
      >
        <FaFileExcel /> Download Monthly Report
      </button>
    </div>
  );
}
