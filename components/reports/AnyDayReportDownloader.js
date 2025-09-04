import { FaFileExcel } from "react-icons/fa";
import BASE_URL from "../../utils/api";

export default function AnyDayReportDownloader({ userId, userName }) {
  const downloadReport = async (type) => {
    try {
      const token = localStorage.getItem("token");
      let url = "";

      if (type === "today") {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        url = `${BASE_URL}/api/reports/user/${userId}?type=daily&date=${today}`;
      } else if (type === "yesterday") {
        url = `${BASE_URL}/api/reports/user/${userId}?type=previous-daily`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Download error:", res.status, text);
        throw new Error("Failed to download");
      }

      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download =
        type === "today"
          ? `${userName}-daily-report.xlsx`
          : `${userName}-yesterday-report.xlsx`;
      a.click();
      window.URL.revokeObjectURL(fileUrl);
    } catch (err) {
      console.error(`❌ ${type} report download error:`, err);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => downloadReport("today")}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow"
      >
        <FaFileExcel /> Download Today’s Report
      </button>

      <button
        onClick={() => downloadReport("yesterday")}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow"
      >
        <FaFileExcel /> Download Yesterday’s Report
      </button>
    </div>
  );
}
