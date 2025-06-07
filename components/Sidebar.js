import { FiHome, FiUpload, FiSettings, FiUsers } from "react-icons/fi";

const Sidebar = ({ open, onClose }) => (
  <>
    {/* Overlay for mobile */}
    <div
      className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300 md:hidden ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    />
    <aside
      className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-2xl border-r
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:static md:translate-x-0 md:shadow-none md:border-r-0
        flex flex-col
      `}
    >
      {/* Logo and close */}
      <div className="flex items-center justify-between px-6 py-4 border-b md:border-none">
        <span className="font-bold text-xl text-indigo-600">Leads CRM</span>
        <button onClick={onClose} className="md:hidden text-2xl text-gray-400 hover:text-gray-600">&times;</button>
      </div>
      <nav className="flex flex-col mt-6 gap-2 px-4">
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg text-indigo-600 bg-indigo-50 font-semibold"><FiHome /> Dashboard</a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100"><FiUpload /> Import Leads</a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100"><FiUsers /> Users</a>
        <a href="#" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100"><FiSettings /> Settings</a>
      </nav>
      <div className="mt-auto mb-6 px-6">
        <button className="w-full bg-indigo-100 text-indigo-700 py-2 rounded-lg">Contact Support</button>
      </div>
    </aside>
  </>
);

export default Sidebar;
