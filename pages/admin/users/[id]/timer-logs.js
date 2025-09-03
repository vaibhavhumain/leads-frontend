import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import BASE_URL from "../../../../utils/api";
import AdminNavbar from "../../../../components/AdminNavbar";

const UserTimerLogsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [timerLogs, setTimerLogs] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchTimerLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const me = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        setLoggedInUser(me.data);

        const res = await axios.get(`${BASE_URL}/api/timer-logs/user/${id}`, { headers });
        setTimerLogs(res.data);
      } catch (err) {
        console.error("Error fetching timer logs:", err);
      }
    };
    fetchTimerLogs();
  }, [id]);

  if (timerLogs.length === 0) return <div className="p-6">No timer logs found.</div>;

  const log = timerLogs[currentIndex];

  const nextLog = () => {
    if (currentIndex < timerLogs.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevLog = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <>
      <AdminNavbar loggedInUser={loggedInUser} />
      <div className="p-6 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-pink-700 mb-6">User Timer Logs</h1>

        {/* Timer Log Card */}
        <div className="w-full max-w-2xl p-6 border rounded-lg shadow bg-white">
          <h2 className="text-lg font-semibold text-pink-600 mb-2">
            Lead: {log.leadName}
          </h2>
          <p><b>Duration:</b> {log.duration} seconds</p>
          <p><b>Stopped By:</b> {log.stoppedByName}</p>
          <p><b>Started:</b> {new Date(log.startTime).toLocaleString()}</p>
          <p><b>Stopped:</b> {new Date(log.createdAt).toLocaleString()}</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={prevLog}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={nextLog}
            disabled={currentIndex === timerLogs.length - 1}
            className="px-4 py-2 bg-pink-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <p className="mt-4 text-gray-500">
          Showing {currentIndex + 1} of {timerLogs.length}
        </p>
      </div>
    </>
  );
};

export default UserTimerLogsPage;
