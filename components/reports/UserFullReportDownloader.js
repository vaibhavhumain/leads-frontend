import { FaFileExcel } from "react-icons/fa";
import BASE_URL from "../../utils/api";

export default function UserFullReportDownloader({ userId, userName }) {
  const downloadReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/reports/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to download");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${userName}-full-report.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Full report download error:", err);
    }
  };

  return (
    <button
      onClick={downloadReport}
      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow"
    >
      <FaFileExcel /> Download Full Report
    </button>
  );
}
