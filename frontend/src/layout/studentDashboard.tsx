import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Bell, MessageSquare, Users, Settings } from "lucide-react";

const sidebarItems = [
  { name: "Announcements", icon: Bell, path: "/student/announcement", count: 3 },
  { name: "Messages", icon: MessageSquare, path: "/student/message", count: 3 },
  { name: "Contacts", icon: Users, path: "/student/contacts" },
  { name: "Settings", icon: Settings, path: "/student/settings" },
  { name: "Profile", icon: Settings, path: "/student/profile" },
];

export const Sidebar: React.FC<{
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab =
    sidebarItems.find((item) => location.pathname.startsWith(item.path))?.name ||
    "Announcements";

  const handleTabClick = (path: string) => {
    if (location.pathname !== path) navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-50 w-64 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:shadow-none md:flex md:flex-col
        `}
      >
        {/* Close button (mobile only) */}
        <button
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="md:hidden absolute top-15 right-4 p-2 rounded-md bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Sidebar Header */}
        <div className="flex-1 flex flex-col justify-center items-center pt-10">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-blue-600 mt-10">NST Hub</h2>
            <p className="text-gray-500 mt-1 text-sm">Student Communication</p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-3 w-full px-6">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleTabClick(item.path)}
                className={`flex items-center justify-between w-full px-4 py-2 rounded hover:bg-blue-50 transition ${
                  activeTab === item.name
                    ? "bg-blue-100 font-semibold text-blue-600"
                    : "text-gray-700"
                }`}
                aria-current={activeTab === item.name ? "page" : undefined}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
                {item.count && (
                  <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* User Info */}
        <div className="p-6 border-t border-gray-200 bg-white w-full">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              SJ
            </div>
            <div>
              <p className="text-sm font-semibold">Sarah Johnson</p>
              <p className="text-xs text-gray-500">Computer Science</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export const StudentDashboardLayout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Disable background scrolling when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
  }, [sidebarOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 overflow-hidden relative">
      {/* Hamburger button on small screens */}
      <button
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        className="md:hidden fixed top-15 left-4 z-50 p-2 rounded-md bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      >
        <svg
          className="w-6 h-6 text-indigo-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
        <main
        className="flex-1 h-screen overflow-auto backdrop-blur-xl bg-white/70 p-6 rounded-tl-3xl shadow-inner transition-all duration-500"
        >
        <Outlet />
        </main>

    </div>
  );
};
