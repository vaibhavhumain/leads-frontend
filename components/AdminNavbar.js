import Link from "next/link";
import { FaBriefcase } from "react-icons/fa";
import { useRouter } from "next/router";

const AdminNavbar = ({ loggedInUser }) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-white shadow">
      {/* Left Section (Logo + Brand) */}
      <div className="flex items-center gap-2">
        <FaBriefcase className="text-blue-600 text-2xl" />
        <span className="text-blue-600 font-bold text-lg">Leads Portal</span>
      </div>

      {/* Right Section (Links + User) */}
      <div className="flex items-center gap-6">
        {/* Logged in user */}
        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 font-medium">
          {loggedInUser?.role === "admin" ? "Admin" : "User"}
        </span>

        {/* Dashboard */}
        <Link
          href="/admin/dashboard"
          className="text-gray-700 hover:text-blue-600 font-medium"
        >
          Dashboard
        </Link>

        {/* Users */}
        <Link
          href="/admin/users"
          className="text-gray-700 hover:text-blue-600 font-medium"
        >
          Users
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="px-3 py-1 rounded bg-red-100 text-red-500 hover:text-red-600 font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar;
