"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus,
  Trash2,
  Search,
  BookOpen,
  ShieldCheck,
  Mail,
  CheckCircle2,
  XCircle,
  User,
  X,
  Save,
} from "lucide-react";

// ✅ UUID-safe type
interface Teacher {
  id: string;
  full_name: string;
  email: string;
  department: string;
  degree?: string;
  school_from?: string;
  specialization?: string;
  experience_years?: number;
  status?: "Active" | "Inactive";
  created_at?: string;
}

const AdminTeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    degree: "",
    school_from: "",
    specialization: "",
    experience_years: "",
  });
  const [loading, setLoading] = useState(false);
  const adminToken =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const BASE_URL = "http://localhost:5000/api/admin/users/teachers";

  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setTeachers(res.data.data ?? []);
    } catch (err) {
      console.error("❌ Error fetching teachers:", err);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(
    (t) =>
      t.full_name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.department?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddTeacher = () => setIsModalOpen(true);

  // Save new teacher
  const handleSave = async () => {
    const {
      full_name,
      email,
      password,
      confirmPassword,
      department,
      degree,
      school_from,
      specialization,
      experience_years,
    } = formData;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!full_name || !email || !password || !department) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        full_name,
        email,
        password,
        department,
        degree,
        school_from,
        specialization,
        experience_years: Number(experience_years) || 0,
      };

      const res = await axios.post(BASE_URL, payload, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      const saved = res.data.data ?? res.data;
      setTeachers((prev) => [saved, ...prev]);
      setIsModalOpen(false);
      setFormData({
        full_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        department: "",
        degree: "",
        school_from: "",
        specialization: "",
        experience_years: "",
      });
    } catch (err) {
      console.error("❌ Error saving teacher:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete teacher
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this teacher?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setTeachers((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("❌ Error deleting teacher:", err);
    }
  };

  // Toggle status
  const handleToggleStatus = async (id: string, currentStatus?: string) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await axios.patch(
        `${BASE_URL}/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: newStatus as "Active" | "Inactive" } : t
        )
      );
    } catch (err) {
      console.error("❌ Error toggling status:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 min-h-screen mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center gap-2">
          <ShieldCheck className="text-blue-600" />
          Teacher Management
        </h1>
        <button
          onClick={handleAddTeacher}
          className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg shadow hover:scale-[1.02] transition-transform text-sm"
        >
          <UserPlus size={16} /> Add Teacher
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-5 max-w-md w-full">
        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search by name, email, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-3 py-2 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white/80 backdrop-blur-sm transition text-sm"
        />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.length === 0 ? (
          <p className="text-gray-500 italic col-span-full text-center text-sm">
            No teachers found.
          </p>
        ) : (
          filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-semibold text-sm select-none">
                  {teacher.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-800 truncate">
                    {teacher.full_name}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                    <Mail size={12} />
                    <span className="truncate">{teacher.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-gray-700 text-sm truncate">
                  <BookOpen size={14} />
                  <span className="font-medium capitalize truncate">
                    {teacher.department || "N/A"}
                  </span>
                </div>
                <span
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                    teacher.status === "Inactive"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {teacher.status === "Active" ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <XCircle size={12} />
                  )}
                  {teacher.status || "Active"}
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleToggleStatus(teacher.id, teacher.status)}
                  className={`px-2 py-1 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${
                    teacher.status === "Active"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {teacher.status === "Active" ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(teacher.id)}
                  className="px-2 py-1 text-xs rounded-md font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-gradient-to-br from-white via-slate-50 to-blue-50 rounded-3xl shadow-xl p-6 sm:p-8 w-full max-w-md max-h-[90vh] overflow-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 flex items-center justify-center gap-2">
              <User className="text-blue-600" /> Register New Teacher
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <input
                type="text"
                placeholder="Full Name"
                className="col-span-2 bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:bg-white placeholder-gray-400 transition"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
              />
              <input
                type="email"
                placeholder="Email"
                className="col-span-2 bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:bg-white placeholder-gray-400 transition"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Password"
                className="bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:bg-white placeholder-gray-400 transition"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:bg-white placeholder-gray-400 transition"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Department / Subject"
                className="col-span-2 bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:bg-white placeholder-gray-400 transition"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Highest Degree"
                className="bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:bg-white placeholder-gray-400 transition"
                value={formData.degree}
                onChange={(e) =>
                  setFormData({ ...formData, degree: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="School/University"
                className="bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:bg-white placeholder-gray-400 transition"
                value={formData.school_from}
                onChange={(e) =>
                  setFormData({ ...formData, school_from: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Field of Specialization"
                className="bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:bg-white placeholder-gray-400 transition"
                value={formData.specialization}
                onChange={(e) =>
                  setFormData({ ...formData, specialization: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Years of Teaching Experience"
                className="bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:bg-white placeholder-gray-400 transition"
                value={formData.experience_years}
                onChange={(e) =>
                  setFormData({ ...formData, experience_years: e.target.value })
                }
              />
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2 rounded-lg shadow-md hover:scale-[1.03] transition-transform disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Saving..." : "Register Teacher"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeachersPage;
