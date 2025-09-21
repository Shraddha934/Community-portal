"use client";
import { X, BarChart3, Settings, Users } from "lucide-react";
import Link from "next/link";

export default function Sidebar({ open, setOpen }) {
  if (!open) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 p-6 overflow-y-auto">
      {/* Close button */}
      <button
        onClick={() => setOpen(false)}
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
      >
        <X size={24} />
      </button>

      <h2 className="text-xl font-bold mb-6">⚙️ Features</h2>
      <div className="flex flex-col gap-4">
        {/* Analytics navigates to /analytics */}
        <Link
          href="/analytics"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 p-3 rounded-md bg-gray-100 hover:bg-gray-200 transition"
        >
          <BarChart3 size={20} /> Analytics
        </Link>

        {/* Other menu items */}
        <button className="flex items-center gap-2 p-3 rounded-md bg-gray-100 hover:bg-gray-200 transition">
          <Settings size={20} /> Settings
        </button>

        <button className="flex items-center gap-2 p-3 rounded-md bg-gray-100 hover:bg-gray-200 transition">
          <Users size={20} /> User Management
        </button>
      </div>
    </div>
  );
}
