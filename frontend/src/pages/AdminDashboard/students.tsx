"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus,
  Trash2,
  Search,
  User,
  Edit,
  X,
  Save,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Filter,
  Mail,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  email: string;
  studentid: string;
  yearlevel: string;
  department: string;
  status?: "Active" | "Inactive";
  created_at?: string;
}

const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentid: "",
    yearlevel: "",
    department: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const adminToken =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const BASE_URL = `${import.meta.env.VITE_API_URL}/admin/users/students`;

  const courses = [
    { label: "Bachelor of Science in Information System", value: "BSIS" },
    {
      label: "Bachelor of Science in Accounting Information Systems",
      value: "BSAIS",
    },
    { label: "Bachelor of Science in Criminology", value: "BSCRIM" },
    { label: "Bachelor of Science in Entrepreneurship", value: "BSENTREP" },
    {
      label: "Bachelor of Technical‑Vocational Teacher Education",
      value: "BTVTE",
    },
  ];

  const fetchStudents = async () => {
    try {
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setStudents(res.data.data ?? []);
    } catch (err) {
      console.error("❌ Error fetching students:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      (filterDept === "All" ||
        s.department.toLowerCase() === filterDept.toLowerCase()) &&
      (s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.yearlevel.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAddStudent = () => {
    setFormData({
      name: "",
      email: "",
      studentid: "",
      yearlevel: "",
      department: "",
      password: "",
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEdit = (student: Student) => {
    setFormData({
      name: student.name,
      email: student.email,
      studentid: student.studentid,
      yearlevel: student.yearlevel,
      department: student.department,
      password: "",
    });
    setSelectedId(student.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const { name, email, studentid, yearlevel, department, password } = formData;
    if (!name || !email || !yearlevel || !department || !studentid) {
      alert("Please fill all required fields, including Student ID.");
      return;
    }
    try {
      setLoading(true);
      if (isEditing && selectedId) {
        const payload = { name, email, studentid, yearlevel, department };
        const res = await axios.put(`${BASE_URL}/${selectedId}`, payload, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setStudents((prev) =>
          prev.map((s) => (s.id === selectedId ? res.data.data : s))
        );
      } else {
        const payload = {
          name,
          email,
          password,
          studentid,
          yearlevel,
          department,
        };
        const res = await axios.post(BASE_URL, payload, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        setStudents((prev) => [res.data.data, ...prev]);
      }
      setIsModalOpen(false);
      setIsEditing(false);
      setFormData({
        name: "",
        email: "",
        studentid: "",
        yearlevel: "",
        department: "",
        password: "",
      });
    } catch (err) {
      console.error("❌ Error saving student:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this student?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("❌ Error deleting student:", err);
    }
  };

  const handleToggleStatus = async (id: string, status?: string) => {
    const newStatus = status === "Active" ? "Inactive" : "Active";
    try {
      await axios.patch(
        `${BASE_URL}/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: newStatus as "Active" | "Inactive" } : s
        )
      );
    } catch (err) {
      console.error("❌ Error updating status:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-green-50 via-white to-emerald-50 min-h-screen mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-3">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center gap-2">
          <GraduationCap className="text-green-600" />
          Student Management
        </h1>
        <button
          onClick={handleAddStudent}
          className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-md shadow hover:scale-[1.02] transition-transform text-sm"
        >
          <UserPlus size={16} /> Register Student
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-8">
        <div className="relative w-full sm:w-1/2">
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, email, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-3 py-2 rounded-md w-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none placeholder-gray-400 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-gray-500" />
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="border px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-sm"
          >
            <option value="All">All Departments</option>
            {[...new Set(students.map((s) => s.department))].map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.length === 0 ? (
          <p className="col-span-full text-gray-500 italic text-center py-12 text-sm">
            No registered students yet.
          </p>
        ) : (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 shadow hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg shadow select-none">
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
                    {student.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <Mail size={12} />
                    <span>{student.email}</span>
                  </p>
                  <small className="text-xs text-gray-400 truncate">
                    {student.studentid}
                  </small>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-700 truncate">
                  Year Level: <b>{student.yearlevel || "N/A"}</b>
                </p>
                <span
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                    student.status === "Inactive"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {student.status === "Active" ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <XCircle size={14} />
                  )}
                  {student.status || "Active"}
                </span>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleToggleStatus(student.id, student.status)}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors whitespace-nowrap ${
                    student.status === "Active"
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {student.status === "Active" ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleEdit(student)}
                  className="px-3 py-1.5 text-xs rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(student.id)}
                  className="px-3 py-1.5 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-auto shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800 flex items-center justify-center gap-2">
              <User className="text-green-600" /> {isEditing ? "Edit Student" : "Register Student"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <input
                type="text"
                placeholder="Full Name"
                className="col-span-2 bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:bg-white transition placeholder-gray-400"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="col-span-2 bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:bg-white transition placeholder-gray-400"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Student ID (e.g. NS2025001)"
                className="bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:bg-white transition placeholder-gray-400"
                value={formData.studentid}
                onChange={(e) => setFormData({ ...formData, studentid: e.target.value })}
              />
              <input
                type="text"
                placeholder="Year Level"
                className="bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:bg-white transition placeholder-gray-400"
                value={formData.yearlevel}
                onChange={(e) => setFormData({ ...formData, yearlevel: e.target.value })}
              />
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="bg-gray-100/70 rounded-lg px-3 py-2 col-span-2 focus:ring-2 focus:ring-green-400 focus:bg-white transition placeholder-gray-400"
              >
                <option value="">Select Course / Department</option>
                {courses.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>

              {!isEditing && (
                <input
                  type="password"
                  placeholder="Password"
                  className="col-span-2 bg-gray-100/70 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400 focus:bg-white transition placeholder-gray-400"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2 rounded-lg shadow-md hover:scale-[1.03] transition-transform disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Saving..." : isEditing ? "Update Student" : "Save Student"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudentsPage;
