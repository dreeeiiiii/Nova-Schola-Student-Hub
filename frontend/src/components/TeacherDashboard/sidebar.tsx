import React from "react";
import {
  Bell,
  MessageSquare,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface TeacherSidebarProps {
  onLogout?: () => void;
}

const sidebarItems = [
  { name: "Announcements", icon: Bell, path: "announcements" },
  { name: "Messages", icon: MessageSquare, path: "messages" },
  { name: "Profile", icon: User, path: "profile" },
  { name: "Settings", icon: Settings, path: "setting" },
];

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleItemClick = (path: string) => {
    navigate(`/teacher/dashboard/${path}`);
  };

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col items-center justify-between shadow-lg fixed left-0 top-0">
      {/* Center Group (Header + Nav) */}
      <div className="flex flex-col items-center justify-center flex-1 w-full space-y-6">
        {/* Header */}
        <div className="text-2xl font-bold text-center">Teacher Dashboard</div>

        {/* Navigation */}
        <nav className="flex flex-col items-center justify-center w-full gap-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);

            return (
              <button
                key={item.name}
                onClick={() => handleItemClick(item.path)}
                className={`flex items-center gap-3 w-[85%] justify-center rounded-lg py-3 text-sm font-medium transition-all duration-200 ${
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
      </div>

      {/* Logout (Bottom) */}
      <div className="w-full p-4 border-t border-gray-700 flex justify-center">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
