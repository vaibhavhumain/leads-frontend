import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import BASE_URL from "../../../../utils/api";
import AdminNavbar from "../../../../components/AdminNavbar";
import Calendar from "react-calendar"; // 📅 calendar package
import "react-calendar/dist/Calendar.css"; // default styles

const UserLeadsPage = () => {
  const router = useRouter();
  const { id, date } = router.query;

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(date ? new Date(date) : null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const me = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        setLoggedInUser(me.data);

        let url = `${BASE_URL}/api/leads/user/${id}`;
        if (date) url += `?date=${date}`;

        const res = await axios.get(url, { headers });
        setLeads(res.data || []);
      } catch (err) {
        console.error("Error fetching user leads:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, date]);

  // Handle calendar change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    const isoDate = newDate.toISOString().split("T")[0]; // YYYY-MM-DD
    router.push(`/admin/users/${id}/leads?date=${isoDate}`);
  };

  if (loading) return <p>Loading leads...</p>;

  return (
    <>
      <AdminNavbar loggedInUser={loggedInUser} />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">User Leads</h1>

        {/* 📅 Calendar */}
        <div className="mb-6 flex justify-center">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
          />
        </div>

        {date && (
          <p className="mb-4 text-gray-600 text-center">
            Showing leads edited on{" "}
            <span className="font-semibold">{date}</span>
          </p>
        )}

        {leads.length === 0 ? (
          <p className="text-center text-gray-500">No leads found for this date.</p>
        ) : (
          <ul className="space-y-2 max-w-2xl mx-auto">
            {leads.map((lead) => (
              <li key={lead._id} className="p-4 border rounded bg-white shadow-sm">
                <p className="font-semibold text-indigo-700">
                  {lead.leadDetails.clientName}
                </p>
                <p className="text-gray-600">{lead.leadDetails.companyName}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default UserLeadsPage;
