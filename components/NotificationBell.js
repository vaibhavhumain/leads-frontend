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
  className="relative p-2 rounded-full "
  onClick={() => setOpen(o => !o)}
  aria-label="Show notifications"
>
  <BellIcon className="w-7 h-7" style={{ color: '#23263a' }} />
  {unreadCount > 0 && (
    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5">
      {unreadCount}
    </span>
  )}
</button>


      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-[#171a23] shadow-xl rounded-xl border border-gray-800 z-50 max-h-96 overflow-y-auto transition-all duration-200">
          <div className="p-3 border-b border-gray-700 font-bold text-gray-100 bg-[#23263a] rounded-t-xl">Notifications</div>
          {notifications.length === 0 && (
            <div className="p-4 text-gray-400 text-sm">No notifications.</div>
          )}
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`flex items-start gap-2 px-4 py-3 border-b border-gray-800 last:border-b-0 cursor-pointer transition-all duration-100
                ${notif.read ? 'bg-[#202534]' : 'bg-[#263159]'}
                hover:bg-[#2a3556]`}
              onClick={async () => {
                if (!notif.read) await markAsRead(notif._id);
              }}
              title={notif.message}
            >
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-100">{notif.message}</div>
                <div className="text-xs text-gray-400">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</div>
              </div>
              {!notif.read && <span className="mt-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">NEW</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
