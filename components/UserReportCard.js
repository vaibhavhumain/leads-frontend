import { useState } from "react";
import { FaCalendarDay, FaCalendarWeek, FaCalendarAlt } from "react-icons/fa";
import downloadDailyLeadReport from "./Report";
import downloadWeeklyLeadReport from "./downloadWeeklyLeadReport";
import downloadMonthlyLeadReport from "./downloadMonthlyLeadReport";
import PreviousDayReportDownloader from "./PreviousDayReportDownloader";

const today = new Date().toISOString().slice(0, 10);

export default function UserReportCard({ user, isAdmin }) {
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [month, setMonth] = useState("");

  // Helpers
  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diffToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().slice(0, 10),
      end: sunday.toISOString().slice(0, 10),
    };
  };

  const getMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay.toISOString().slice(0, 10),
      end: lastDay.toISOString().slice(0, 10),
    };
  };

  return (
    <div className="bg-white border border-indigo-200 rounded-xl p-5 shadow-md hover:shadow-lg transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-indigo-700">{user.name}</h3>
        <span className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full">
          Reports
        </span>
      </div>

      {/* Quick Report Buttons */}
      <div className="space-y-2 mb-6">
        <button
          onClick={() => downloadDailyLeadReport(today, user._id)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow"
        >
          <FaCalendarDay /> Daily Report
        </button>

        <button
          onClick={() => {
            const { start, end } = getWeekRange();
            downloadWeeklyLeadReport(start, end, user._id);
          }}
          className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow"
        >
          <FaCalendarWeek /> This Week Report
        </button>

        {isAdmin && (
          <button
            onClick={() => {
              const { start, end } = getMonthRange();
              downloadMonthlyLeadReport(start, end, user._id);
            }}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-md shadow"
          >
            <FaCalendarAlt /> This Month Report
          </button>
        )}
      </div>

      {/* Custom Week Selector */}
      <div className="bg-indigo-50 rounded-lg p-4 mb-6">
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          Select Custom Week
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="border px-2 py-1 rounded text-sm flex-1"
          />
          <input
            type="date"
            value={weekEnd}
            onChange={(e) => setWeekEnd(e.target.value)}
            className="border px-2 py-1 rounded text-sm flex-1"
          />
        </div>
        <button
          disabled={!weekStart || !weekEnd}
          onClick={() => downloadWeeklyLeadReport(weekStart, weekEnd, user._id)}
          className={`mt-3 w-full px-4 py-2 rounded-md text-sm font-medium shadow flex items-center justify-center gap-2 ${
            weekStart && weekEnd
              ? "bg-pink-600 hover:bg-pink-700 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <FaCalendarWeek /> Download Custom Week
        </button>
      </div>

      {/* Custom Month Selector */}
      {isAdmin && (
        <div className="bg-purple-50 rounded-lg p-4 mb-6">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Select Custom Month
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border px-2 py-1 rounded text-sm w-full"
          />
          <button
            disabled={!month}
            onClick={() => {
              const [year, mon] = month.split("-");
              const start = `${year}-${mon}-01`;
              const end = new Date(year, mon, 0).toISOString().slice(0, 10);
              downloadMonthlyLeadReport(start, end, user._id);
            }}
            className={`mt-3 w-full px-4 py-2 rounded-md text-sm font-medium shadow flex items-center justify-center gap-2 ${
              month
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <FaCalendarAlt /> Download Custom Month
          </button>
        </div>
      )}

      {/* Previous Day Report */}
      <div className="mt-4">
        <PreviousDayReportDownloader userId={user._id} userName={user.name} />
      </div>
    </div>
  );
}
