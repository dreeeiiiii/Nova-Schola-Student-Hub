import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, MessageSquare, Users, Settings } from "lucide-react";

const sidebarItems = [
  { name: "Announcements", icon: Bell, path: "/student/announcement", count: 3 },
  { name: "Messages", icon: MessageSquare, path: "/student/message", count: 3 },
  { name: "Contacts", icon: Users, path: "/student/contacts" },
  { name: "Settings", icon: Settings, path: "/student/settings" },
  { name: "Profile", icon: Settings, path: "/student/profile" },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeTab =
    sidebarItems.find((item) => location.pathname.startsWith(item.path))?.name ||
    "Announcements";

  const handleTabClick = (path: string) => {
    if (location.pathname !== path) navigate(path);
    setSidebarOpen(false); // close sidebar on small screens after navigation
  };

  return (
    <>
      {/* Hamburger button - visible only on small screens */}
      <button
        className="fixed top-10 right-4 z-50 p-2 rounded-md bg-white shadow-md md:hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Toggle Sidebar"
        onClick={() => setSidebarOpen(!sidebarOpen)}
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

      {/* Sidebar overlay on small screens */}
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
        {/* Header */}
        <div className="flex-1 flex flex-col justify-center items-center pt-10 my-4 md:my-0">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-blue-600">NST Hub</h2>
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
        <div className="p-6 border-t border-gray-200 bg-white w-full my-4 md:my-0">
          <div className="flex items-center gap-3">
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
