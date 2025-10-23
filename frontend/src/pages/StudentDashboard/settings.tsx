import React, { useState } from "react";
import { Lock } from "lucide-react";

export const SettingsPage: React.FC = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = () => {
    // Validation
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      return setMessage("❌ Please fill in all fields");
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setMessage("❌ New password and confirmation do not match");
    }

    // TODO: call API to update password
    setMessage("✅ Password updated successfully!");
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-indigo-100 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-indigo-700 mb-6 text-center">Settings</h1>

        {message && (
          <div className="mb-4 p-3 rounded text-center text-sm bg-indigo-100 text-indigo-700">
            {message}
          </div>
        )}

        {/* Password Section */}
        <section className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 flex items-center gap-2 mb-3">
            <Lock size={18} /> Change Password
          </h2>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, currentPassword: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, confirmPassword: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>
        </section>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition"
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};
