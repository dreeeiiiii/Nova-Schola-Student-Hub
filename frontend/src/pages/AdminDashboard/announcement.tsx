"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Megaphone,
  Pencil,
  Trash2,
  Plus,
  Save,
  X,
  Image,
} from "lucide-react";
import AdminRefreshButton from "../../components/Admin/refreshButton";

interface Announcement {
  id: string;
  title: string;
  author: string;
  target: "Teachers" | "Students";
  date: string;
  content: string;
  image_url?: string;
}

const AdminAnnouncementPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewing, setViewing] = useState<Announcement | null>(null);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: "",
    author: "",
    target: "Students",
    content: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://localhost:5000/api/announcements";
  const adminToken =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  /* ---------------- Fetch ---------------- */
  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setAnnouncements(res.data.data ?? []);
    } catch (e) {
      console.error("❌ Error fetching announcements:", e);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line
  }, []);

  const handleRefresh = () => fetchAnnouncements();

  /* ---------------- CRUD ---------------- */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setViewing(null);
    } catch (e) {
      console.error("❌ Error deleting:", e);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setFormData({
      title: announcement.title,
      author: announcement.author,
      target: announcement.target,
      content: announcement.content,
      date: announcement.date,
    });
    setIsModalOpen(true);
    setViewing(null);
  };

  const handleCreate = () => {
    setEditing(null);
    setFormData({
      title: "",
      author: "",
      target: "Students",
      content: "",
      date: new Date().toISOString().split("T")[0],
    });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.author || !formData.content) {
      alert("Please fill all fields.");
      return;
    }
    try {
      setLoading(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => v && payload.append(k, v.toString()));
      if (imageFile) payload.append("file", imageFile);

      const config = {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editing) {
        const res = await axios.put(`${BASE_URL}/${editing.id}`, payload, config);
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editing.id ? res.data.data : a))
        );
      } else {
        const res = await axios.post(BASE_URL, payload, config);
        setAnnouncements((prev) => [res.data.data, ...prev]);
      }

      setIsModalOpen(false);
      setEditing(null);
    } catch (e) {
      console.error("❌ Error saving:", e);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="pt-24 pb-8 px-4 sm:px-8 bg-gradient-to-br from-blue-50 via-white to-indigo-100 min-h-screen transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Megaphone className="text-indigo-600" />
          Admin Announcements
        </h1>
        <div className="flex gap-3 w-full sm:w-auto">
          <AdminRefreshButton onRefresh={handleRefresh} />
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-xl hover:bg-indigo-700 shadow-md transition-all hover:scale-[1.02] justify-center text-sm"
          >
            <Plus size={16} /> New Announcement
          </button>

        </div>
      </div>

      {/* Announcement Grid */}
      <div className="bg-white/90 rounded-3xl p-4 sm:p-6 shadow-lg border border-indigo-100 backdrop-blur-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Megaphone className="text-indigo-500" />
          Latest Announcements
        </h2>

        {announcements.length === 0 ? (
          <div className="text-center py-16">
            <Image size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 italic text-lg">No announcements found.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {announcements.map((a) => (
              <div
                key={a.id}
                onClick={() => setViewing(a)}
                className="cursor-pointer group rounded-2xl overflow-hidden bg-gradient-to-br from-white to-indigo-50 shadow hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col hover:scale-[1.02] hover:-translate-y-1"
              >
                {a.image_url ? (
                  <div className="relative overflow-hidden">
                    <img
                      src={a.image_url}
                      alt={a.title}
                      className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ) : (
                  <div className="h-44 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                    <Image size={48} className="group-hover:scale-110 transition-transform" />
                  </div>
                )}
                <div className="p-4 sm:p-5 flex flex-col flex-1 mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate group-hover:text-indigo-700 transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 line-clamp-3 mb-3">
                    {a.content}
                  </p>
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 items-center text-xs text-gray-400">
                      <span className="font-semibold text-indigo-700">{a.author}</span>
                      <span>•</span>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                        {a.target}
                      </span>
                      <span>•</span>
                      <span>{a.date ? new Date(a.date).toLocaleDateString() : "No Date"}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {(isModalOpen || viewing) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in mt-15">
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600/10 via-white to-indigo-50 sticky top-0 z-10">
              <h3 className="text-xl font-semibold text-indigo-800 flex items-center gap-2 truncate">
                <Megaphone className="text-indigo-600 flex-shrink-0" />
                <span className="truncate">
                  {editing
                    ? "Edit Announcement"
                    : viewing
                    ? viewing.title
                    : "Create Announcement"}
                </span>
              </h3>
              <button
                onClick={() => {
                  setViewing(null);
                  setIsModalOpen(false);
                  setEditing(null);
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition flex-shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
              {!editing && viewing ? (
                // View Mode
                <div className="px-6 py-6 space-y-6">
                  {viewing.image_url && (
                    <div className="relative">
                      <img
                        src={viewing.image_url}
                        alt={viewing.title}
                        className="w-full max-h-80 object-cover rounded-xl shadow-lg"
                      />
                    </div>
                  )}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">{viewing.title}</h2>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                        {viewing.target}
                      </span>
                      <span className="text-gray-600">
                        <strong>By:</strong> {viewing.author}
                      </span>
                      <span className="text-gray-600">
                        <strong>Date:</strong> {new Date(viewing.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                        {viewing.content}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Create/Edit Mode
                <div className="px-6 py-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white/60 py-3 px-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white/60 py-3 px-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={formData.target}
                      onChange={(e) =>
                        setFormData({ ...formData, target: e.target.value as "Teachers" | "Students" })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white/60 py-3 px-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    >
                      <option value="Students">Students</option>
                      <option value="Teachers">Teachers</option>
                    </select>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-white/60 py-3 px-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                  </div>

                  <textarea
                    placeholder="Write announcement content..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full rounded-xl border border-gray-200 bg-white/60 py-3 px-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
                  />

                  <div className="flex items-center justify-between bg-white/70 px-4 py-3 rounded-xl border border-gray-200 mt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-indigo-600 hover:text-indigo-800 font-medium transition">
                      <Image size={18} />
                      <span>Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {imageFile && (
                      <span className="text-sm text-gray-500 truncate max-w-[200px]">
                        {imageFile.name}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Sticky */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-white to-indigo-50 sticky bottom-0 mt-8">
              {!editing && viewing ? (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleEdit(viewing)}
                    className="px-4 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(viewing.id)}
                    className="px-4 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              ) : (
                <div className="flex justify-end ">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-2 px-6 rounded-xl hover:scale-[1.02] shadow-md transition-transform disabled:opacity-50"
                  >
                    <Save size={18} />
                    {loading ? "Saving..." : editing ? "Update" : "Save Announcement"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default AdminAnnouncementPage;
