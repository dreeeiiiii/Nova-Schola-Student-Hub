"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Megaphone, Trash2, Plus, Save, X, Image } from "lucide-react";
import AdminRefreshButton from "../../components/Admin/refreshButton";

interface Announcement {
  id: string;
  title: string;
  author: string;
  target: string; // "All" or department
  content: string;
  date: string;
  image_url?: string;
}

const courses = ["All", "BSIS", "BSENTREP", "BSAIS", "BSCRIM"];

const AdminAnnouncementPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: "",
    author: "",
    target: "All",
    content: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [, setLoading] = useState(false);

  const BASE_URL = "http://localhost:5000/api/announcements";
  const adminToken =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  // ---------------- Fetch ----------------
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setAnnouncements(res.data.data ?? []);
    } catch (e) {
      console.error("❌ Error fetching announcements:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleRefresh = () => fetchAnnouncements();

  // ---------------- CRUD ----------------
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setEditing(null);
      setIsModalOpen(false);
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
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditing(null);
    setFormData({
      title: "",
      author: "",
      target: "All",
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
    if (!formData.title || !formData.author || !formData.content || !formData.target) {
      alert("Please fill all required fields.");
      return;
    }

    try {
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
      setFormData({
        title: "",
        author: "",
        target: "All",
        content: "",
        date: new Date().toISOString().split("T")[0],
      });
      setImageFile(null);
    } catch (e) {
      console.error("❌ Error saving:", e);
    }
  };

  // ---------------- UI ----------------
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
                onClick={() => handleEdit(a)}
                className="cursor-pointer group rounded-2xl overflow-hidden bg-gradient-to-br from-white to-indigo-50 shadow hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col hover:scale-[1.02] hover:-translate-y-1"
              >
                {a.image_url ? (
                  <div className="relative overflow-hidden">
                    <img
                      src={a.image_url}
                      alt={a.title}
                      className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="h-44 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
                    <Image size={48} />
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
                        {a.target === "All" ? "All Departments" : a.target}
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
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-auto p-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-4">
              {editing ? "Edit Announcement" : "Create Announcement"}
            </h2>

            {/* Form */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-gray-200 py-3 px-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />

              <textarea
                placeholder="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full rounded-xl border border-gray-200 py-3 px-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none"
              />

              <input
                type="text"
                placeholder="Author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full rounded-xl border border-gray-200 py-3 px-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 py-3 px-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                />

                <select
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 py-3 px-4 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                >
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "All Departments" : c}
                    </option>
                  ))}
                </select>
              </div>

              <input type="file" onChange={handleFileChange} />

              <button
                onClick={handleSave}
                className="flex items-center gap-2 justify-center w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-all"
              >
                <Save size={16} />
                {editing ? "Update Announcement" : "Create Announcement"}
              </button>

              {editing && (
                <button
                  onClick={() => handleDelete(editing.id)}
                  className="flex items-center gap-2 justify-center w-full bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all"
                >
                  <Trash2 size={16} /> Delete Announcement
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncementPage;
