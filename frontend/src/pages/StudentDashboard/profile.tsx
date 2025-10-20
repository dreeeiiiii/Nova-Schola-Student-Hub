import React, { useEffect, useState } from "react";

interface StudentProfile {
  id?: string;
  name: string;
  email: string;
  studentid: string;
  yearlevel: string;
  department: string;
  status?: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    const token = localStorage.getItem("studentToken");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const { password_hash, ...sanitizedProfile } = json.data;
        setProfile(sanitizedProfile);
      }
    } catch {
      // ignore errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSave = async () => {
    if (!profile) return;
    const token = localStorage.getItem("studentToken");
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setProfile(json.data);
        setIsEditing(false);
        setModal({ type: "success", message: "Profile updated successfully!" });
      } else {
        setModal({ type: "error", message: "Failed to update profile: " + json.message });
      }
    } catch {
      setModal({ type: "error", message: "An error occurred while updating profile." });
    } finally {
      setSaving(false);
      setTimeout(() => setModal(null), 2500);
    }
  };

  if (loading)
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading profile...</div>;

  if (!profile)
    return <div className="flex items-center justify-center min-h-screen text-red-500">No profile data found.</div>;

  // Limit initials size and spacing to avoid oversized look
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 3); // max 3 letters

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex flex-col items-center p-4 md:p-8">
      {modal && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-md z-50">
          <div
            className={`rounded-lg p-4 max-w-xs w-full text-center shadow-lg ${
              modal.type === "success" ? "bg-green-100 border border-green-500" : "bg-red-100 border border-red-500"
            }`}
          >
            <p className={`text-base font-semibold ${modal.type === "success" ? "text-green-700" : "text-red-700"}`}>
              {modal.message}
            </p>
          </div>
        </div>
      )}

      <header className="w-full max-w-4xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl shadow-lg p-6 md:p-8 mb-6 md:mb-8 flex items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-28 h-28 md:w-36 md:h-36 bg-white/10 rounded-full blur-2xl" />
        <div
          className="flex items-center justify-center rounded-full bg-white/25 border-2 border-white text-2xl md:text-3xl font-semibold text-white min-w-[64px] min-h-[64px]"
          title={profile.name}
        >
          {initials}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold truncate">{profile.name}</h1>
          <p className="text-sm text-indigo-100 mt-1 truncate">{profile.department}</p>
          <p className="text-xs text-indigo-200 mt-0.5 truncate">NST College — {profile.yearlevel}</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </header>

      <section className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm md:text-base">
        {Object.entries(profile).map(([key, value]) => {
          if (key === "id" || key === "status") return null;

          let displayValue = value;
          if (key === "created_at" || key === "updated_at") {
            displayValue = new Date(String(value)).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          }

          const isReadOnly = ["role", "department", "created_at"].includes(key);

          return (
            <div key={key}>
              <label className="text-xs md:text-sm text-gray-500 capitalize mb-1 block">{key.replace(/([A-Z])/g, " $1")}</label>
              {isEditing && !isReadOnly ? (
                <input
                  type="text"
                  name={key}
                  value={String(displayValue)}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 text-sm md:text-base"
                />
              ) : (
                <p className="font-medium text-gray-800">{String(displayValue)}</p>
              )}
            </div>
          );
        })}
      </section>

      {isEditing && (
        <div className="w-full max-w-4xl flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-2 rounded-lg text-white text-base font-semibold transition ${
              saving ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {saving ? (
              <svg
                className="animate-spin h-5 w-5 mx-auto text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      )}

      <footer className="w-full max-w-4xl text-center mt-8 text-xs text-gray-400 select-none">
        © 2025 NST Student Hub — All rights reserved.
      </footer>
    </div>
  );
};

export default ProfilePage;
