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
        className="relative p-2 rounded-full bg-yellow-100 border border-yellow-400 hover:bg-yellow-200 transition"
        onClick={() => setOpen(o => !o)}
        aria-label="Show notifications"
      >
        <BellIcon className="w-6 h-6 text-yellow-800" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-md z-50">
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-200 font-bold text-gray-700">
            Notifications
          </div>

          {/* Notification List */}
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center italic">No notifications.</div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif._id}
                className={`px-4 py-3 text-sm border-b last:border-0 cursor-pointer ${
                  notif.read ? "bg-gray-100" : "bg-yellow-50"
                } hover:bg-yellow-100`}
                onClick={async () => { if (!notif.read) await markAsRead(notif._id); }}
              >
                <div className="font-medium text-gray-800">{notif.message}</div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
