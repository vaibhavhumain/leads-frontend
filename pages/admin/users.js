import { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../utils/api";
import AdminNavbar from "../../components/AdminNavbar";
import Link from "next/link";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const me = await axios.get(`${BASE_URL}/api/users/me`, { headers });
        setLoggedInUser(me.data);

        const res = await axios.get(`${BASE_URL}/api/users`, { headers });
        const filteredUsers = res.data.filter(
          (u) => u.role !== "admin" && u.name.toLowerCase() !== "admin"
        );
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 🌟 Loading Animation
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

  return (
    <>
      <AdminNavbar loggedInUser={loggedInUser} />
      <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-indigo-50 min-h-screen">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-8 text-center animate-fadeIn">
          👥 All Users
        </h1>

        {/* Users Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => {
            const initials = user.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "U";

            return (
              <Link
                key={user._id}
                href={`/admin/users/${user._id}`}
                className="p-6 bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 animate-fadeIn"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar Circle */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white font-bold text-lg shadow">
                    {initials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{user.name}</div>
                    <div className="text-gray-600 text-sm">{user.email}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

// ✨ Custom Animations
const styles = `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-in-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
}
`;

export default UsersPage;
