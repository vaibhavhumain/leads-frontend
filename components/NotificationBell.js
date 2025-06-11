import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import BASE_URL from '../utils/api';
import { BellIcon } from '@heroicons/react/24/solid';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState('');
  const bellRef = useRef();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token') || '');
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchNotifications() {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }

  async function markAsRead(id) {
    if (!token) return;
    try {
      await axios.post(`${BASE_URL}/api/notifications/mark-read/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((n) =>
        n.map(notif => notif._id === id ? { ...notif, read: true } : notif)
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
  <div className="relative" ref={bellRef}>
  <button
    className="relative p-2 rounded-full transition-all duration-150 group focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg bg-gradient-to-br from-[#241d3b] to-[#362a68] border-2 border-yellow-400/20 hover:border-yellow-400/50"
    onClick={() => setOpen(o => !o)}
    aria-label="Show notifications"
  >
    <span className="inline-block relative">
      <BellIcon
        className={`w-7 h-7 text-yellow-300 drop-shadow-md transition-transform duration-300 ${
          unreadCount > 0 ? "animate-bounce" : ""
        }`}
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 z-10 animate-pulse bg-gradient-to-br from-rose-600 via-yellow-400 to-yellow-200 border-2 border-yellow-300 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-xl ring-2 ring-yellow-200/80">
          {unreadCount}
        </span>
      )}
    </span>
    {/* Subtle animated border shine */}
    <span className="absolute -inset-1 rounded-full pointer-events-none border-2 border-yellow-200/30 blur-[2px] opacity-70 animate-shimmer"></span>
  </button>

  {/* Dropdown */}
  <div className={`transition-all duration-300 ease-in-out ${open ? "block" : "hidden"}`}>
    <div className="absolute right-0 mt-3 w-80 min-w-[320px] max-w-[360px] max-h-96 shadow-2xl rounded-2xl z-50 bg-gradient-to-br from-[#25223e]/95 via-[#131425]/90 to-[#3d2e67]/90 border border-yellow-400/30 backdrop-blur-xl overflow-y-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-yellow-300/20 bg-gradient-to-r from-yellow-300/10 via-transparent to-yellow-200/20 rounded-t-2xl">
        <span className="text-lg font-extrabold text-yellow-300 tracking-wide drop-shadow">
          <span className="inline-block animate-wiggle">🔔</span> Notifications
        </span>
        {unreadCount > 0 && (
          <span className="text-xs font-bold bg-yellow-400 text-yellow-900 rounded-full px-2 py-0.5 shadow">
            {unreadCount} new
          </span>
        )}
      </div>
      {/* Notification List */}
      {notifications.length === 0 ? (
        <div className="p-5 text-yellow-100 text-sm text-center italic">No notifications.</div>
      ) : (
        notifications.map((notif) => (
          <div
            key={notif._id}
            className={`
              flex items-start gap-3 px-5 py-4 cursor-pointer transition-all duration-150 border-b border-yellow-200/10 last:border-0
              ${notif.read
                ? "bg-[#232135]/80"
                : "bg-gradient-to-r from-yellow-100/10 via-yellow-200/5 to-yellow-200/10 shadow-lg ring-1 ring-yellow-400/20"}
              hover:bg-[#2b2566]/80 group
            `}
            onClick={async () => { if (!notif.read) await markAsRead(notif._id); }}
            title={notif.message}
            style={{
              borderLeft: notif.read ? "5px solid #292662" : "5px solid #ffd700"
            }}
          >
            <div className="flex-1">
              <div className="font-semibold text-base text-yellow-100 group-hover:text-yellow-300 transition-colors">
                {notif.message}
              </div>
              <div className="text-xs text-yellow-200/80 mt-1">
                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
              </div>
            </div>
            {!notif.read && (
              <span className="mt-1 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold animate-pulse ring-2 ring-yellow-200/60 shadow">NEW</span>
            )}
          </div>
        ))
      )}
    </div>
  </div>
  <style jsx>{`
    @keyframes fade-in { from { opacity: 0; transform: translateY(-12px);} to { opacity: 1; transform: translateY(0);} }
    .animate-fade-in { animation: fade-in 0.27s cubic-bezier(0.3, 0.9, 0.4, 1.4); }
    @keyframes shimmer { 0% { box-shadow: 0 0 12px 2px #ffd70030, 0 0 4px 1px #fff2; } 70% { box-shadow: 0 0 25px 5px #ffd70080, 0 0 10px 2px #fff9; } 100% { box-shadow: 0 0 12px 2px #ffd70030, 0 0 4px 1px #fff2; } }
    .animate-shimmer { animation: shimmer 2.2s infinite; }
    @keyframes wiggle { 0%, 100% { transform: rotate(-10deg);} 50% { transform: rotate(15deg);} }
    .animate-wiggle { animation: wiggle 1.1s infinite alternate cubic-bezier(.72,-0.2,.24,1.15);}
    /* Custom dark scrollbar for notifications */
    .overflow-y-auto::-webkit-scrollbar { width: 6px; }
    .overflow-y-auto::-webkit-scrollbar-thumb { background: #423a6a; border-radius: 3px; }
    .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
  `}</style>
</div>
);
}
