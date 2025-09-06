import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import BASE_URL from "../../../../utils/api";
import AdminNavbar from "../../../../components/AdminNavbar";
import Link from "next/link";

const UserDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const me = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        setLoggedInUser(me.data);

        const userRes = await axios.get(`${BASE_URL}/api/users/${id}`, { headers });
        setUser(userRes.data);
      } catch (err) {
        console.error("Error fetching user details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-200">
        <div className="flex space-x-3">
          <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 font-semibold">
        ❌ User not found
      </div>
    );
  }

  return (
    <>
      <AdminNavbar loggedInUser={loggedInUser} />
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-indigo-50 min-h-screen">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-8 text-center animate-fadeIn">
          {user.name} - Profile
        </h1>

        {/* Profile Card */}
        <div className="max-w-xl mx-auto bg-white bg-opacity-80 backdrop-blur-md shadow-2xl rounded-2xl p-8 transition transform hover:scale-[1.01] animate-fadeIn">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">👤 Basic Info</h2>
          <p className="text-lg mb-2">
            <span className="font-semibold text-gray-700">📧 Email:</span>{" "}
            <span className="text-gray-900">{user.email}</span>
          </p>
          <p className="text-lg">
            <span className="font-semibold text-gray-700">🎭 Role:</span>{" "}
            <span className="capitalize text-indigo-600 font-semibold">
              {user.role}
            </span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center mt-10 gap-6 animate-fadeIn">
          <Link
            href={`/admin/users/${user._id}/leads`}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 transform hover:-translate-y-1 transition"
          >
            📊 View Leads
          </Link>
          <Link
            href={`/admin/users/${user._id}/timer-logs`}
            className="px-6 py-3 bg-pink-600 text-white rounded-xl shadow hover:bg-pink-700 transform hover:-translate-y-1 transition"
          >
            ⏱️ View Timer Logs
          </Link>
          <Link
            href={`/admin/users/${user._id}/edit-dates`}
            className="px-6 py-3 bg-yellow-500 text-white rounded-xl shadow hover:bg-yellow-600 transform hover:-translate-y-1 transition"
          >
            🗓️ View Edit Dates
          </Link>
        </div>
      </div>
    </>
  );
};

// ✨ Animations
const styles = `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .animate-fadeIn {
    animation: fadeIn 0.7s ease-in-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(15px); }
    to { opacity: 1; transform: translateY(0); }
  }
}
`;

export default UserDetailsPage;
