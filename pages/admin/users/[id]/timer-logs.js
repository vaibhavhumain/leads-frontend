import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import BASE_URL from "../../../../utils/api";
import AdminNavbar from "../../../../components/AdminNavbar";

// 🔹 Helper: format duration from seconds → hh:mm:ss
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}m ` : ""}${s}s`;
}

const UserTimerLogsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [timerLogs, setTimerLogs] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchTimerLogs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const me = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        setLoggedInUser(me.data);

        const res = await axios.get(`${BASE_URL}/api/timer-logs/user/${id}`, {
          headers,
        });
        setTimerLogs(res.data);
      } catch (err) {
        console.error("Error fetching timer logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimerLogs();
  }, [id]);

  // 🔹 Group logs by lead
  const groupedLogs = timerLogs.reduce((acc, log) => {
    if (!acc[log.leadName]) acc[log.leadName] = [];
    acc[log.leadName].push(log);
    return acc;
  }, {});

  const leadNames = Object.keys(groupedLogs);

  // 🔹 Loading animation
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-pink-200 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-4 border-pink-600 animate-spin"></div>
        </div>
        <p className="mt-4 text-pink-600 font-medium text-lg">
          Fetching timer logs...
        </p>
      </div>
    );
  }

  if (timerLogs.length === 0)
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-500">
        <p className="text-lg">No timer logs found.</p>
      </div>
    );

  const currentLead = leadNames[currentIndex];
  const logs = groupedLogs[currentLead] || [];
  const totalDuration = logs.reduce((acc, l) => acc + (l.duration || 0), 0);

  return (
    <>
      <AdminNavbar loggedInUser={loggedInUser} />
      <div className="p-6 flex flex-col items-center bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-pink-700 mb-6">
          User Timer Logs
        </h1>

        {/* Single Card */}
        <div className="w-full max-w-4xl">
          <div className="p-6 border border-pink-200 rounded-xl shadow-md bg-white hover:shadow-lg transition flex flex-col">
            {/* Header */}
            <h2 className="text-xl font-bold text-pink-700 mb-4">
              Lead: {currentLead}
            </h2>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border">
                      Start Time
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border">
                      Stop Time
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border">
                      Follow-ups
                    </th>
                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => {
                    const date = new Date(log.createdAt);
                    const start = log.startTime
                      ? new Date(log.startTime)
                      : null;
                    const stop = log.stoppedAt
                      ? new Date(log.stoppedAt)
                      : null;

                    return (
                      <tr key={idx} className="hover:bg-pink-50">
                        <td className="px-3 py-2 text-sm border">
                          {date.toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-sm border">
                          {start ? start.toLocaleTimeString() : "-"}
                        </td>
                        <td className="px-3 py-2 text-sm border">
                          {stop ? stop.toLocaleTimeString() : "-"}
                        </td>
                        {/* Follow-ups */}
                        <td className="px-3 py-2 text-sm border">
                          {log.followUps && log.followUps.length > 0 ? (
                            log.followUps.map((f, j) => (
                              <div key={j}>
                                {f.date
                                  ? new Date(f.date).toLocaleDateString()
                                  : ""}
                                {f.remark ? ` - ${f.remark}` : ""}
                              </div>
                            ))
                          ) : (
                            "-"
                          )}
                        </td>
                        {/* Notes */}
                        <td className="px-3 py-2 text-sm border">
                          {log.notes && log.notes.length > 0 ? (
                            log.notes.map((n, j) => (
                              <div key={j}>{n.text}</div>
                            ))
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Info */}
            <div className="mt-4 flex justify-between text-sm text-gray-700 border-t pt-2">
              <span>
                <b>Total Sessions:</b> {logs.length}
              </span>
              <span>
                <b>Total Duration:</b> {formatDuration(totalDuration)}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() =>
                setCurrentIndex((prev) => Math.max(prev - 1, 0))
              }
              disabled={currentIndex === 0}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentIndex === 0
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-pink-600 text-white hover:bg-pink-700"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentIndex((prev) =>
                  Math.min(prev + 1, leadNames.length - 1)
                )
              }
              disabled={currentIndex === leadNames.length - 1}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentIndex === leadNames.length - 1
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-pink-600 text-white hover:bg-pink-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserTimerLogsPage;
