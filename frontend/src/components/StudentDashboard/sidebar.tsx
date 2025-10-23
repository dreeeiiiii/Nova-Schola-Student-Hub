import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, MessageSquare, Users, Settings } from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function parseToken(token: string | null) {
  if (!token) return { id: "", name: "User", department: "" };
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.id,
      name: payload.name || "User",
      department: payload.department || "",
    };
  } catch {
    return { id: "", name: "User", department: "" };
  }
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("studentToken");
  const { name, department, id: userId } = parseToken(token);

  const [unreadCount, setUnreadCount] = useState<number | undefined>(0);

  const API_URL = import.meta.env.VITE_API_URL || "";

  // ---------------- Fetch unread message count ----------------
  useEffect(() => {
    if (!token || !userId) return;

    const fetchUnread = async () => {
      try {
        const res = await fetch(`${API_URL}/lastChats/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch unread count");
        const data = await res.json();
        setUnreadCount(data.count > 0 ? data.count : undefined);
      } catch (err) {
        console.error("Unread fetch error:", err);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [token, userId, API_URL]);

  // ---------------- Clear unread if on Messages page ----------------
  useEffect(() => {
    if (location.pathname.startsWith("/student/message")) {
      setUnreadCount(undefined);
    }
  }, [location.pathname]);

  const sidebarItems = [
    { name: "Announcements", icon: Bell, path: "/student/announcement" },
    { name: "Messages", icon: MessageSquare, path: "/student/message", count: unreadCount },
    { name: "Contacts", icon: Users, path: "/student/contacts" },
    { name: "Settings", icon: Settings, path: "/student/settings" },
    { name: "Profile", icon: Settings, path: "/student/profile" },
  ];

  const activeTab =
    sidebarItems.find((item) => location.pathname.startsWith(item.path))?.name || "Announcements";

  const handleTabClick = (path: string) => {
    if (location.pathname !== path) navigate(path);
    setSidebarOpen(false);
  };

  const initials = name
    ? name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-50 w-64 transform transition-transform duration-300 mt-10
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
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold">{name}</p>
              <p className="text-xs text-gray-500">{department || "No department"}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
