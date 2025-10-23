"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  User,
  CheckCircle,
  Trash2,
  MessageSquare,
  RefreshCw,
  ShieldAlert,
  Filter,
} from "lucide-react";

interface Violation {
  id: string;
  name: string;
  role: "Student" | "Teacher";
  reason: string;
  date: string;
  status: "Pending" | "Reviewed";
  reportedBy: string;
}

const AdminViolationsPage: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [filter, setFilter] = useState<"All" | "Student" | "Teacher">("All");
  const adminToken =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const BASE_URL = `${import.meta.env.VITE_API_URL}/admin/violations`;

  const fetchViolations = async () => {
    try {
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setViolations(res.data.data ?? []);
    } catch (err) {
      console.error("❌ Error fetching violations:", err);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  const handleMarkReviewed = async (id: string) => {
    try {
      await axios.put(
        `${BASE_URL}/${id}/status`,
        { status: "Reviewed" },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      fetchViolations();
    } catch (err) {
      console.error("❌ Error marking reviewed:", err);
    }
  };

  const handleSendWarning = (id: string) => {
    const v = violations.find((x) => x.id === id);
    if (v) alert(`⚠️ Warning sent to ${v.name}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this violation permanently?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      fetchViolations();
    } catch (err) {
      console.error("❌ Error deleting violation:", err);
    }
  };

  const handleRefresh = () => fetchViolations();

  const filteredViolations = filter === "All" ? violations : violations.filter((v) => v.role === filter);

  return (
    <div className="p-6 sm:p-8 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 min-h-screen mt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <ShieldAlert className="text-red-500" />
          Violation Reports
        </h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 shadow-md transition text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <Filter className="text-gray-500" size={18} />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "All" | "Student" | "Teacher")}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="All">All</option>
          <option value="Student">Students</option>
          <option value="Teacher">Teachers</option>
        </select>
      </div>

      {/* Table Container with horizontal scroll on small */}
      <div className="bg-white/90 backdrop-blur-md shadow-md rounded-2xl overflow-x-auto border border-gray-200">
        <table className="min-w-[720px] w-full text-left table-auto border-separate border-spacing-0">
          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <tr>
              <th className="p-3 text-left text-xs leading-4">Name</th>
              <th className="p-3 text-left text-xs leading-4">Role</th>
              <th className="p-3 text-left text-xs leading-4 max-w-xs">Reason</th>
              <th className="p-3 text-left text-xs leading-4">Reported By</th>
              <th className="p-3 text-left text-xs leading-4">Date</th>
              <th className="p-3 text-left text-xs leading-4">Status</th>
              <th className="p-3 text-center text-xs leading-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredViolations.map((v) => (
              <tr key={v.id} className="border-b hover:bg-blue-50 transition-colors">
                <td className="p-3 font-medium text-gray-800 flex items-center gap-2 whitespace-nowrap">
                  <User className="text-gray-400" size={16} />
                  {v.name}
                </td>
                <td className="p-3 whitespace-nowrap">{v.role}</td>
                <td className="p-3 text-gray-600 max-w-xs truncate" title={v.reason}>
                  {v.reason}
                </td>
                <td className="p-3 text-sm text-gray-500 whitespace-nowrap">{v.reportedBy}</td>
                <td className="p-3 text-sm text-gray-500 whitespace-nowrap">
                  {new Date(v.date).toLocaleDateString()}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      v.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {v.status}
                  </span>
                </td>
                <td className="p-3 flex justify-center gap-2 whitespace-nowrap">
                  {v.status === "Pending" && (
                    <button
                      onClick={() => handleMarkReviewed(v.id)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded-md transition"
                      aria-label="Mark as Reviewed"
                    >
                      <CheckCircle size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleSendWarning(v.id)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition"
                    aria-label="Send Warning"
                  >
                    <MessageSquare size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-md transition"
                    aria-label="Delete Violation"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredViolations.length === 0 && (
          <p className="text-center text-gray-500 py-6 italic text-sm">
            No violations found for this filter.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminViolationsPage;
