"use client";
import React, { useEffect, useState } from "react";
import { ToggleRight, Save, RefreshCcw, CheckCircle } from "lucide-react";

interface AdminSettings {
  siteName: string;
  maintenanceMode: boolean;
  notificationsEnabled: boolean;
  defaultUserRole: "Student" | "Teacher";
}

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettings>({
    siteName: "Nova Schola Hub",
    maintenanceMode: false,
    notificationsEnabled: true,
    defaultUserRole: "Student",
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // Simulate real-time changes (could be from WebSocket in production)
  useEffect(() => {
    const interval = setInterval(() => {
      // Example: external change on notifications toggle
      const random = Math.random() > 0.7;
      setSettings((prev) => ({ ...prev, notificationsEnabled: random }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1000);
  };

  const handleToggle = (key: keyof AdminSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-8 min-h-screen bg-gray-100">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Save size={18} />
          {saveStatus === "saving" ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Settings Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
        {/* Site Name */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <label className="w-48 text-gray-600">Site Name:</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="border p-2 rounded-lg flex-1"
          />
        </div>

        {/* Maintenance Mode */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <label className="w-48 text-gray-600">Maintenance Mode:</label>
          <button
            onClick={() => handleToggle("maintenanceMode")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              settings.maintenanceMode
                ? "bg-red-500 text-white"
                : "bg-green-500 text-white"
            }`}
          >
            <ToggleRight />
            {settings.maintenanceMode ? "ON" : "OFF"}
          </button>
        </div>

        {/* Notifications */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <label className="w-48 text-gray-600">Notifications:</label>
          <button
            onClick={() => handleToggle("notificationsEnabled")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              settings.notificationsEnabled
                ? "bg-blue-500 text-white"
                : "bg-gray-400 text-white"
            }`}
          >
            <ToggleRight />
            {settings.notificationsEnabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        {/* Default User Role */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <label className="w-48 text-gray-600">Default User Role:</label>
          <select
            value={settings.defaultUserRole}
            onChange={(e) =>
              setSettings({ ...settings, defaultUserRole: e.target.value as "Student" | "Teacher" })
            }
            className="border p-2 rounded-lg"
          >
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
          </select>
        </div>

        {/* Real-time Status */}
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCcw className="animate-spin" size={18} /> Real-time updates active
        </div>

        {/* Save Status */}
        {saveStatus === "success" && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle /> Settings saved successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
