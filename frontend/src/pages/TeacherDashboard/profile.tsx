import React, { useState } from "react";
import { Edit3, Mail, Building2, Calendar, Megaphone, MessageSquare } from "lucide-react";

export const TeacherProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [teacher, setTeacher] = useState({
    name: "Prof. Andrea Lopez",
    email: "andrea.lopez@nst.edu.ph",
    department: "Science and Technology",
    subjects: "Physics, Research",
    totalAnnouncements: 8,
    totalMessages: 42,
    totalEvents: 3,
  });

  const [formData, setFormData] = useState(teacher);

  const handleEditToggle = () => {
    if (isEditing) {
      setTeacher(formData);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left - Profile Card */}
      <div className="bg-white shadow-xl rounded-2xl p-6 w-full lg:w-1/3 text-center border border-indigo-100">
        <div className="relative">
          <img
            src="https://i.pravatar.cc/200?img=12"
            alt="Teacher Avatar"
            className="w-32 h-32 rounded-full mx-auto border-4 border-indigo-400 shadow-md"
          />
          <button
            onClick={handleEditToggle}
            className="absolute top-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-md transition"
          >
            <Edit3 size={18} />
          </button>
        </div>

        <h2 className="text-xl font-bold mt-4 text-gray-800">{teacher.name}</h2>
        <p className="text-gray-500 flex items-center justify-center gap-1">
          <Mail size={16} /> {teacher.email}
        </p>
        <p className="text-gray-500 flex items-center justify-center gap-1 mt-1">
          <Building2 size={16} /> {teacher.department}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="bg-indigo-50 p-3 rounded-xl shadow-sm">
            <Megaphone className="mx-auto text-indigo-500" size={22} />
            <p className="text-sm font-semibold">{teacher.totalAnnouncements}</p>
            <span className="text-xs text-gray-500">Announcements</span>
          </div>
          <div className="bg-indigo-50 p-3 rounded-xl shadow-sm">
            <MessageSquare className="mx-auto text-indigo-500" size={22} />
            <p className="text-sm font-semibold">{teacher.totalMessages}</p>
            <span className="text-xs text-gray-500">Messages</span>
          </div>
          <div className="bg-indigo-50 p-3 rounded-xl shadow-sm">
            <Calendar className="mx-auto text-indigo-500" size={22} />
            <p className="text-sm font-semibold">{teacher.totalEvents}</p>
            <span className="text-xs text-gray-500">Events</span>
          </div>
        </div>
      </div>

      {/* Right - Editable Info */}
      <div className="flex-1 bg-white shadow-xl rounded-2xl p-8 border border-indigo-100">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-6">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Full Name</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Email Address</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Department</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Subjects</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={formData.subjects}
              onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="mt-8">
          {isEditing ? (
            <button
              onClick={handleEditToggle}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition"
            >
              Save Changes
            </button>
          ) : (
            <button
              onClick={handleEditToggle}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg shadow-md transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
