import { useState } from "react";
import {
  FaUser,
  FaChevronDown,
  FaChevronUp,
  FaUsers,
} from "react-icons/fa";
import UserReportCard from "./UserReportCard";

export default function ReportsSection({ users, loggedInUser }) {
  const [selectedUser, setSelectedUser] = useState("all");
  const [open, setOpen] = useState(false);

  // Filter users list
  const filteredUsers = users.filter(
    (user) => user._id !== loggedInUser?._id && user.name !== "Admin"
  );
  const visibleUsers =
    selectedUser === "all"
      ? filteredUsers
      : filteredUsers.filter((u) => u._id === selectedUser);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-10 border border-indigo-100">
      {/* --- Header with Toggle --- */}
      <div
        className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 cursor-pointer select-none"
        onClick={() => setOpen((prev) => !prev)}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-700 flex items-center gap-2">
          <FaUsers className="text-indigo-500" /> Reports for Users
        </h2>
        <div className="transition-transform">
          {open ? (
            <FaChevronUp className="text-indigo-600" />
          ) : (
            <FaChevronDown className="text-indigo-600" />
          )}
        </div>
      </div>

      {/* --- Collapsible Body --- */}
      {open && (
        <div className="p-6 bg-gray-50">
          {/* User Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select User
            </label>
            <div className="relative w-full sm:w-64">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="appearance-none border border-indigo-200 rounded-lg px-4 py-2 text-sm w-full pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
              >
                <option value="all">All Users</option>
                {filteredUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-indigo-500">
                <FaChevronDown />
              </div>
            </div>
          </div>

          {/* User Cards */}
          {visibleUsers.length > 0 ? (
            visibleUsers.length === 1 ? (
              <div className="flex justify-center">
                <UserReportCard
                  user={visibleUsers[0]}
                  isAdmin={loggedInUser?.role === "admin"}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleUsers.map((user) => (
                  <UserReportCard
                    key={user._id}
                    user={user}
                    isAdmin={loggedInUser?.role === "admin"}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="italic text-gray-400 text-center py-8">
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
