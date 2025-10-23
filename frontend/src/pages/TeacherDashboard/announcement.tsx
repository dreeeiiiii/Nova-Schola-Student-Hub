import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Plus, X } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  imageUrl?: string;
  goingCount?: number;
  notGoingCount?: number;
  notSureCount?: number;
  userResponse?: string | null;
  place?: string;
  time?: string;
  category?: string;
}

interface AnnouncementForm {
  title: string;
  description: string;
  category: string;
  image?: File;
  author: string;
  date: string;
  time: string;
  place: string;
}

interface AnnouncementCardProps {
  a: Announcement;
  canEdit?: boolean;
  onEdit?: (a: Announcement) => void;
  onDelete?: (id: string) => void;
}

function parseJwtToken(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

const courses = ["All", "BSIS", "BSENTREP", "BSAIS", "BSCRIM"];

export const TeacherAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [myAnnouncements, setMyAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<string | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState<AnnouncementForm>({
    title: "",
    description: "",
    category: courses[0],
    image: undefined,
    author: currentTeacher,
    date: "",
    time: "",
    place: "",
  });

  // Keep formData.author synced with currentTeacher (from JWT)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      author: currentTeacher,
    }));
  }, [currentTeacher]);

  // Decode token to get currentTeacher name on mount
  useEffect(() => {
    const token = localStorage.getItem("teacherToken");
    if (token) {
      const decoded = parseJwtToken(token);
      if (decoded && decoded.name) {
        setCurrentTeacher(decoded.name);
      }
    }
  }, []);

  // Fetch announcements and filter my announcements by currentTeacher
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("teacherToken");
        const res = await fetch("/announcements", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.data) {
          setAnnouncements(data.data);
          setMyAnnouncements(
            data.data.filter((a: Announcement) => a.author === currentTeacher)
          );
        }
      } catch (err) {
        console.error("❌ Failed to fetch announcements", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentTeacher) fetchAnnouncements();
  }, [currentTeacher]);

  // Create/update announcement - preserve existing fields when editing
  const handleSaveAnnouncement = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const form = new FormData();
      if (formData.title) form.append("title", formData.title);
      if (formData.description) form.append("content", formData.description);
      // Always send currentTeacher as author to match backend expectations
      form.append("author", currentTeacher);
      if (formData.category) form.append("target", formData.category);
      if (formData.date) form.append("date", formData.date);
      if (formData.time) form.append("time", formData.time);
      if (formData.place) form.append("place", formData.place);
      if (formData.image) form.append("file", formData.image);

      const token = localStorage.getItem("teacherToken");

      let res: Response;
      if (editingAnnouncementId) {
        res = await fetch(`${import.meta.env.VITE_API_URL}/announcements/${editingAnnouncementId}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
      } else {
        res = await fetch(`${import.meta.env.VITE_API_URL}/announcements`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
      }

      const data = await res.json();

      if (res.ok) {
        if (editingAnnouncementId) {
          setAnnouncements((prev) =>
            prev.map((a) => (a.id === editingAnnouncementId ? data.data : a))
          );
          setMyAnnouncements((prev) =>
            prev.map((a) => (a.id === editingAnnouncementId ? data.data : a))
          );
        } else {
          setAnnouncements((prev) => [data.data, ...prev]);
          if (data.data.author === currentTeacher) {
            setMyAnnouncements((prev) => [data.data, ...prev]);
          }
        }
        setMessage({ type: "success", text: "Announcement saved successfully." });
        setIsModalOpen(false);
        setEditingAnnouncementId(null);
        setFormData({
          title: "",
          description: "",
          category: courses[0],
          image: undefined,
          author: currentTeacher,
          date: "",
          time: "",
          place: "",
        });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save announcement." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to save announcement." });
      console.error("❌ Failed to save announcement", err);
    } finally {
      setSaving(false);
    }
  };

  // Load existing announcement data into form for editing
  const handleEditAnnouncement = (a: Announcement) => {
    setFormData({
      title: a.title,
      description: a.description,
      category: a.category || courses[0],
      image: undefined,
      author: a.author,
      date: a.date,
      time: a.time || "",
      place: a.place || "",
    });
    setIsModalOpen(true);
    setEditingAnnouncementId(a.id);
  };

  // Confirm and delete announcement
  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const token = localStorage.getItem("teacherToken");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMyAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      } else {
        console.error("Failed to delete announcement");
      }
    } catch (err) {
      console.error("Error deleting announcement", err);
    }
  };

  // Announcement card UI with edit/delete buttons if allowed
  const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ a, canEdit, onEdit, onDelete }) => (
    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-md border-l-4 border-indigo-400 flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800">{a.title}</h3>
      <p className="text-sm text-gray-600 mb-2">{a.description}</p>
      {a.imageUrl && (
        <img
          src={a.imageUrl}
          alt={a.title}
          className="w-full h-44 object-cover rounded-lg mb-3"
        />
      )}
      <p className="text-xs text-gray-500 mb-3">
        📅 {new Date(a.date).toLocaleDateString()} • By {a.author}
      </p>
      <div className="flex items-center gap-4 mt-auto pt-2 border-t border-gray-200 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <CheckCircle className="text-green-600" size={18} />
          <span>{a.goingCount ?? 0} Going</span>
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="text-red-600" size={18} />
          <span>{a.notGoingCount ?? 0} Not Going</span>
        </div>
      </div>

      {canEdit && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => onEdit && onEdit(a)}
            className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete && onDelete(a.id)}
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen p-4 md:p-6 bg-blue-50/50">
      {/* Create Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md"
        >
          <Plus size={18} /> Create Announcement
        </button>
      </div>

      {/* My Announcements */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-indigo-700 mb-3">My Announcements</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : myAnnouncements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myAnnouncements.map((a) => (
              <AnnouncementCard
                key={a.id}
                a={a}
                canEdit={true}
                onEdit={handleEditAnnouncement}
                onDelete={handleDeleteAnnouncement}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven’t created any announcements yet.</p>
        )}
      </section>

      {/* All Announcements */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-indigo-700 mb-3">All Announcements</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : announcements.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((a) => (
              <AnnouncementCard key={a.id} a={a} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No announcements found.</p>
        )}
      </section>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl p-6 relative overflow-auto max-h-full">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingAnnouncementId(null);
                setFormData({
                  title: "",
                  description: "",
                  category: courses[0],
                  image: undefined,
                  author: currentTeacher,
                  date: "",
                  time: "",
                  place: "",
                });
                setMessage(null);
                setSaving(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {editingAnnouncementId ? "Edit Announcement" : "Create Announcement"}
            </h2>

            {/* Saving and message display */}
            {saving && (
              <div className="mb-2 text-blue-600 font-semibold">Saving...</div>
            )}
            {message && (
              <div
                className={`mb-2 font-semibold ${
                  message.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {message.text}
              </div>
            )}

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAnnouncement();
              }}
            >
              {/* Title */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  placeholder="Enter announcement title"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  disabled={saving}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Description</label>
                <textarea
                  rows={4}
                  placeholder="Enter announcement description"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  disabled={saving}
                />
              </div>

              {/* Category */}
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Department</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                  disabled={saving}
                >
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time */}
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  disabled={saving}
                />
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                  disabled={saving}
                />
              </div>

              {/* Place */}
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="Enter location"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  value={formData.place}
                  onChange={(e) =>
                    setFormData({ ...formData, place: e.target.value })
                  }
                  disabled={saving}
                />
              </div>

              {/* Image */}
              <div className="flex flex-col">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.files?.[0] })
                  }
                  className="w-full text-gray-700"
                  disabled={saving}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingAnnouncementId(null);
                    setFormData({
                      title: "",
                      description: "",
                      category: courses[0],
                      image: undefined,
                      author: currentTeacher,
                      date: "",
                      time: "",
                      place: "",
                    });
                    setMessage(null);
                    setSaving(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
