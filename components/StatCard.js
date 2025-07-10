const StatCard = ({ label, value, icon }) => (
  <div className="bg-white border rounded p-4 flex flex-col items-center">
    {icon && <div className="text-gray-400 mb-2">{icon}</div>}
    <div className="text-gray-500 text-sm mb-1">{label}</div>
    <div className="text-3xl font-bold text-indigo-600">{value}</div>
  </div>
);

export default StatCard;
