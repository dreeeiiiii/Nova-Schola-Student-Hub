import React, { useState, useEffect } from "react";
import { Edit3, Mail, Building2 } from "lucide-react";

export const TeacherProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);

  const token = localStorage.getItem("teacherToken");

  // ---------------- FETCH TEACHER ----------------
  useEffect(() => {
    if (!token) return;

    const fetchTeacher = async () => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const teacherId = payload.id;

        const res = await fetch(`/api/profile/teacher/${teacherId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch teacher profile");

        const data = await res.json();

        // your backend sends: { message: "...", data: {...teacher info...} }
        const teacherData = data.data || data;
        setTeacher(teacherData);
        setFormData(teacherData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTeacher();
  }, [token]);

  // ---------------- UPDATE TEACHER ----------------
  const handleEditToggle = async () => {
    if (isEditing && formData) {
      try {
        const payload = JSON.parse(atob(token!.split(".")[1]));
        const teacherId = payload.id;

        const res = await fetch(`/api/profile/teacher/${teacherId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            department: formData.department,
            degree: formData.degree,
            school_from: formData.school_from,
            specialization: formData.specialization,
            experience_years: formData.experience_years,
            status: formData.status,
          }),
        });

        if (!res.ok) throw new Error("Failed to update profile");

        const updated = await res.json();
        const updatedData = updated.data || updated;

        setTeacher(updatedData);
        setFormData(updatedData);
        setIsEditing(false);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    setIsEditing(true);
  };

  if (!teacher || !formData) return <p>Loading profile...</p>;

  return (
    <div className="flex flex-col lg:flex-row gap-8 mt-20">
      {/* Left - Profile Card */}
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full lg:w-1/3 text-center border border-indigo-100">
      <div className="relative w-32 h-32 mx-auto">
  {teacher.avatar ? (
    <img
      src={teacher.avatar}
      alt="Teacher Avatar"
      className="w-32 h-32 rounded-full border-4 border-indigo-400 shadow-md"
    />
  ) : (
    <div className="w-32 h-32 rounded-full border-4 border-indigo-400 shadow-md bg-indigo-400 flex items-center justify-center text-white text-4xl font-bold">
      {teacher.full_name?.[0].toUpperCase() || "T"}
    </div>
  )}

  <button
    onClick={handleEditToggle}
    className="absolute top-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-md transition"
  >
    <Edit3 size={18} />
  </button>
</div>

        <h2 className="text-xl font-bold mt-4 text-gray-800">{teacher.full_name}</h2>
        <p className="text-gray-500 flex items-center justify-center gap-1">
          <Mail size={16} /> {teacher.email}
        </p>
        <p className="text-gray-500 flex items-center justify-center gap-1 mt-1">
          <Building2 size={16} /> {teacher.department}
        </p>
      </div>
  
      {/* Right - Editable Info */}
      <div className="flex-1 bg-white shadow-xl rounded-2xl p-8 border border-indigo-100">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-6">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FULL NAME */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Full Name</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.full_name || ""}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          {/* DEPARTMENT */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Department</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.department || ""}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          {/* DEGREE */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Degree</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.degree || ""}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          {/* SCHOOL FROM */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">School From</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.school_from || ""}
              onChange={(e) => setFormData({ ...formData, school_from: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          {/* SPECIALIZATION */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Specialization</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.specialization || ""}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          {/* EXPERIENCE */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Experience Years</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.experience_years || 0}
              onChange={(e) =>
                setFormData({ ...formData, experience_years: Number(e.target.value) })
              }
              disabled={!isEditing}
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-gray-600 font-medium mb-1">Status</label>
            <select
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.status || "active"}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              disabled={!isEditing}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* BUTTON */}
        <div className="mt-8">
          <button
            onClick={handleEditToggle}
            className={`px-6 py-2 rounded-lg shadow-md transition ${
              isEditing
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};
