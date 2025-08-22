import { useState } from "react";
import Link from "next/link";

const ShareSidebar = ({ 
  lead, 
  sendWhatsAppMessage, 
  notSendWhatsAppMessage, 
  sendWhatsAppPdf 
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2"
      >
        📤 Share Options
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Share Lead</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-red-500 text-xl"
          >
            ✖
          </button>
        </div>

        {/* Options */}
        <div className="p-4 flex flex-col gap-4">
          <button
            onClick={() => {
              sendWhatsAppMessage(lead);
              setOpen(false);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition"
          >
            📩 WhatsApp (Connected)
          </button>

          <button
            onClick={() => {
              notSendWhatsAppMessage(lead);
              setOpen(false);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition"
          >
            📩 WhatsApp (Not Connected)
          </button>

          <button
            onClick={() => {
              sendWhatsAppPdf(lead);
              setOpen(false);
            }}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-600 transition"
          >
            📄 Send PDF
          </button>

          <Link href="/gallery" passHref legacyBehavior>
            <a
              onClick={() => setOpen(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition text-center"
            >
              🖼️ Photos
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShareSidebar;
