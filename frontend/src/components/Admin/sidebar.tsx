import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Megaphone,
  ShieldAlert,
  Wrench,
  BarChart2,
  LogOut,
  Settings,
} from "lucide-react";

const adminSidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { name: "Teachers", icon: Users, path: "/admin/teachers" },
  { name: "Students", icon: GraduationCap, path: "/admin/students" },
  { name: "Violations", icon: ShieldAlert, path: "/admin/violations" },
  { name: "Announcements", icon: Megaphone, path: "/admin/announcements" },
  { name: "Reports & Analytics", icon: BarChart2, path: "/admin/reports-and-analytics" },
  { name: "System Maintenance", icon: Wrench, path: "/admin/system-maintenance" },
  { name: "Settings", icon: Settings, path: "/admin/settings" },
];

interface SidebarProps {
  onLinkClick?: () => void;
}

interface AdminUser {
  fullName: string;
  role: string;
  initials: string;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ onLinkClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [adminUser, setAdminUser] = useState<AdminUser>({
    fullName: "Admin User",
    role: "System Administrator",
    initials: "AD",
  });
  const [loadingUser, setLoadingUser] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const API_URL = import.meta.env.VITE_API_URL || "";

  // ---------------- Fetch Admin Info ----------------
  useEffect(() => {
    const fetchAdminUser = async () => {
      if (!adminToken) {
        setLoadingUser(false);
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/admin/me`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const user = res.data;
        if (user) {
          const fullName = user.fullName || "Admin User";
          const role = user.role || "System Administrator";
          const initials = fullName
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
          setAdminUser({ fullName, role, initials });
        }
      } catch (e) {
        console.error("Error fetching admin user info:", e);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchAdminUser();
  }, [adminToken, API_URL]);

  const activeTab =
    adminSidebarItems.find((item) => location.pathname === item.path)?.name || "Dashboard";

  const handleTabClick = (path: string) => {
    if (location.pathname !== path) navigate(path);
    if (onLinkClick) onLinkClick();
  };

  const confirmLogout = () => {
    localStorage.removeItem("adminToken");
    setIsLogoutModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      <aside
        className="
          flex flex-col justify-between
          h-[calc(100vh-64px)] mt-[74px]
          bg-gradient-to-b from-gray-900 to-gray-800
          text-gray-100 shadow-xl
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="hidden md:block p-6 border-b border-gray-700 text-center">
          <h2 className="text-2xl font-bold text-white tracking-wide">NST Admin</h2>
          <p className="text-sm text-gray-400 mt-1">Management Console</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1 px-3 mt-6 overflow-y-auto scrollbar-thin items-center">
          {adminSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => handleTabClick(item.path)}
                className={`
                  flex items-center gap-3 w-52 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-blue-600 text-white shadow-inner"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-700 p-5 mb-20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold select-none">
              {loadingUser ? "..." : adminUser.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{loadingUser ? "Loading..." : adminUser.fullName}</p>
              <p className="text-xs text-gray-400">{loadingUser ? "" : adminUser.role}</p>
            </div>
          </div>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="mt-4 flex items-center gap-2 text-sm text-gray-300 hover:text-red-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg max-w-sm w-full p-6 mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Logout
            </h3>
            <p className="mb-6 text-gray-700">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
