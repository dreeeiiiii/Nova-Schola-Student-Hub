import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { TeacherSidebar } from "../components/TeacherDashboard/sidebar";

export const TeacherDashboardLayout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 fixed top-0 left-0 h-full bg-white shadow-lg z-20">
        <TeacherSidebar />
      </aside>

      {/* Main content area for subroutes */}
      <main className="flex-1 ml-64 overflow-auto h-screen backdrop-blur-xl bg-white/70 p-6 rounded-tl-3xl shadow-inner transition-all duration-500">
        <Outlet />
      </main>
    </div>
  );
};
