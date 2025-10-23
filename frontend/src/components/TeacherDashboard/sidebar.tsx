import React, { useState, useEffect } from "react";
import { Bell, MessageSquare, User, LogOut, Settings, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface TeacherSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const sidebarItems = [
  { name: "Announcements", icon: Bell, path: "announcements" },
  { name: "Messages", icon: MessageSquare, path: "messages" },
  { name: "Profile", icon: User, path: "profile" },
  { name: "Connect", icon: User, path: "connect" },
  { name: "Settings", icon: Settings, path: "settings" },
];

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  isOpen,
  onClose,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [teacherName, setTeacherName] = useState("");
  const [teacherDept, setTeacherDept] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("teacherToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setTeacherName(payload.name || "Teacher");
        setTeacherDept(payload.department || "");
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  const handleItemClick = (path: string) => {
    navigate(`/teacher/${path}`);
    onClose();
  };

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white shadow-lg
        flex flex-col justify-between p-4 transition-transform duration-300
        md:translate-x-0 mt-10 
        ${isOpen ? "translate-x-0 z-50" : "-translate-x-full z-40"}
        md:block md:relative md:translate-x-0 rounded-lg
      `}
    >
      {/* Mobile close button */}
      <button
        onClick={onClose}
        aria-label="Close sidebar"
        className="absolute top-4 right-4 md:hidden p-2 bg-gray-700 rounded-full shadow-md text-white"
      >
        <X size={20} />
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 flex-1 justify-center">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.path);
          return (
            <button
              key={item.name}
              onClick={() => handleItemClick(item.path)}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom info + Logout */}
      <div className="mt-6 flex flex-col items-center gap-2 mb-10">
        <div className="text-sm text-gray-400 text-center">
          <div>{teacherName}</div>
          <div>{teacherDept}</div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-all mt-2"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
