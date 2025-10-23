import React, { useEffect, useState } from "react";
import { Lock, Moon, Sun } from "lucide-react";

export const TeacherSettings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const teacherId = localStorage.getItem("teacherId");

  // Fetch dark mode preference
  useEffect(() => {
    if (!token || !teacherId) {
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/teachers/${teacherId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        setDarkMode(data.darkMode || false);
      } catch (err) {
        console.error(err);
        alert("❌ Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token, teacherId]);

  const handleSave = async () => {
    if (!token || !teacherId) return alert("❌ Token or ID missing");

    // Validate password fields
    if (passwords.newPassword && passwords.newPassword !== passwords.confirmPassword) {
      return alert("❌ New password and confirmation do not match");
    }

    try {
      // Update password if filled
      if (passwords.currentPassword && passwords.newPassword) {
        const res = await fetch(
          `http://localhost:5000/api/teachers/${teacherId}/password`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              currentPassword: passwords.currentPassword,
              newPassword: passwords.newPassword,
            }),
          }
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to update password");
        }
      }

      // Update dark mode
      await fetch(`http://localhost:5000/api/teachers/${teacherId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ darkMode }),
      });

      alert("✅ Settings saved successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      console.error(err);
      alert(`❌ ${err.message || "Error saving settings"}`);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 border border-indigo-100 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-indigo-700 mb-6">Settings</h1>

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

      {/* Dark Mode Section */}
      <section className="mb-6">
        <h2 className="text-lg font-medium text-gray-700 flex items-center gap-2 mb-3">
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
