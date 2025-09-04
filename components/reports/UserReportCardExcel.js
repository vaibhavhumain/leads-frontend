import UserFullReportDownloader from "./UserFullReportDownloader";
import AnyDayReportDownloader from "./AnyDayReportDownloader";
import AnyWeekReportDownloader from "./AnyWeekReportDownloader";
import AnyMonthReportDownloader from "./AnyMonthReportDownloader";

export default function UserReportCardExcel({ user }) {
  return (
    <div className="bg-white border border-indigo-200 rounded-xl p-5 shadow-md hover:shadow-lg transition">
      <h3 className="text-lg font-bold text-indigo-700 mb-4">{user.name}</h3>

      <div className="space-y-4">
        <UserFullReportDownloader userId={user._id} userName={user.name} />
        <AnyDayReportDownloader userId={user._id} userName={user.name} />
        <AnyWeekReportDownloader userId={user._id} userName={user.name} />
        <AnyMonthReportDownloader userId={user._id} userName={user.name} />
      </div>
    </div>
  );
}
