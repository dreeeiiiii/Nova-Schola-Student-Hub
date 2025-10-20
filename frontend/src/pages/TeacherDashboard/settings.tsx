import React, { useState } from "react";
import { Bell, Lock, Moon, Sun, User } from "lucide-react";

export const TeacherSettings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
  });
  const [formData, setFormData] = useState({
    name: "Prof. Andrea Lopez",
    email: "andrea.lopez@nst.edu.ph",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = () => {
    console.log("Settings saved:", { formData, notifications, darkMode });
    alert("✅ Settings saved successfully!");
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-indigo-100 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-indigo-700 mb-6">Settings</h1>

      {/* Account Info */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-gray-700 flex items-center gap-2 mb-4">
          <User size={18} /> Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Password Settings */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-gray-700 flex items-center gap-2 mb-4">
          <Lock size={18} /> Password
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Current Password</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600 font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-gray-700 flex items-center gap-2 mb-4">
          <Bell size={18} /> Notification Preferences
        </h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
            <span className="text-gray-700">Email Notifications</span>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) =>
                setNotifications({ ...notifications, email: e.target.checked })
              }
              className="w-5 h-5 accent-indigo-600"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
            <span className="text-gray-700">In-App Notifications</span>
            <input
              type="checkbox"
              checked={notifications.inApp}
              onChange={(e) =>
                setNotifications({ ...notifications, inApp: e.target.checked })
              }
              className="w-5 h-5 accent-indigo-600"
            />
          </label>
        </div>
      </section>

      {/* Theme Settings */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-gray-700 flex items-center gap-2 mb-4">
          {darkMode ? <Moon size={18} /> : <Sun size={18} />} Theme
        </h2>
        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
          <span className="text-gray-700">Dark Mode</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
              darkMode ? "bg-indigo-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                darkMode ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
