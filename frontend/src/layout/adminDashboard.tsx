"use client";

import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/Admin/sidebar";
import { Menu, X } from "lucide-react";

export const AdminDashboardLayout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
      {/* 🌐 Floating Toggle Button (Visible on Small Screens) */}
      <button
        onClick={() => setSidebarOpen((prev) => !prev)}
        className={`fixed top-[100px] left-5 z-50 flex items-center justify-center rounded-full p-3 shadow-lg 
          transition-all duration-300
          ${sidebarOpen ? "bg-indigo-700 text-white rotate-90" : "bg-white text-gray-800 hover:bg-gray-100"}
        `}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* 🌀 Overlay for mobile */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`mt-10 fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden
          ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* 🧭 Sidebar */}
      <aside
        className={`fixed top-[64px] left-0 w-64 h-[calc(100vh-64px)] 
          bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 shadow-2xl 
          transform z-50 transition-transform duration-300 
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <AdminSidebar onLinkClick={() => setSidebarOpen(false)} />
      </aside>

      {/* 💻 Main Content */}
      <main
        className="flex-1 md:ml-64 overflow-auto h-screen 
                   bg-white/70 backdrop-blur-xl p-6 rounded-tl-3xl 
                   shadow-inner transition-all duration-500"
      >
        <Outlet />
      </main>
    </div>
  );
};
