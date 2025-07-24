import React from 'react';
import Navbar from '../components/Navbar';
import downloadDailyLeadReport from '../components/Report'; 
import downloadWeeklyLeadReport from '../components/downloadWeeklyLeadReport';
import downloadMonthlyLeadReport from '../components/downloadMonthlyLeadReport';

const ShowReports = () => {
  const today = new Date().toISOString().slice(0, 10);
  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diffToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const start = monday.toISOString().slice(0, 10);
    const end = sunday.toISOString().slice(0, 10);
    return { start, end };
  };

  const getMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay.toISOString().slice(0, 10),
      end: lastDay.toISOString().slice(0, 10),
    };
  };

  const handleDailyDownload = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert("User not logged in");
    downloadDailyLeadReport(today, user._id);
  };

  const handleWeeklyDownload = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert("User not logged in");
    const { start, end } = getWeekRange();
    downloadWeeklyLeadReport(start, end, user._id);
  };

  const handleMonthlyDownload = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert("User not logged in");
    const { start, end } = getMonthRange();
    downloadMonthlyLeadReport(start, end, user._id);
  };

  const reports = [
    {
      title: '📆 Daily Report',
      description: 'Download leads updated today',
      action: handleDailyDownload,
    },
    {
      title: '📈 Weekly Report',
      description: 'Download leads edited this week',
      action: handleWeeklyDownload,
    },
    {
      title: '📊 Monthly Report',
      description: 'Download full monthly lead summary',
      action: handleMonthlyDownload,
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
          📋 Reports Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {reports.map((report, idx) => (
            <div
              key={idx}
              onClick={report.action}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer border hover:border-blue-500 transition-all"
            >
              <h2 className="text-xl font-semibold text-blue-700 mb-2">
                {report.title}
              </h2>
              <p className="text-gray-600 text-sm">{report.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ShowReports;
