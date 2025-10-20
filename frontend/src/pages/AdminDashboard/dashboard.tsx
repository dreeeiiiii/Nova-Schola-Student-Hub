"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  UserCheck,
  Megaphone,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
} from "recharts";

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalAnnouncements: number;
  totalViolations: number;
}

interface UserDistribution {
  name: string;
  value: number;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  date: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00C49F"];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalAnnouncements: 0,
    totalViolations: 0,
  });
  const [userDistribution, setUserDistribution] = useState<UserDistribution[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleActivities, setVisibleActivities] = useState(5);
  const [showMoreLoading, setShowMoreLoading] = useState(false);

  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const BASE_URL = "http://localhost:5000/api/admin/dashboard/overview";

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL, { headers: { Authorization: `Bearer ${adminToken}` } });
      setStats(res.data.stats);
      setUserDistribution(res.data.userDistribution ?? []);
      setRecentActivities(res.data.recentActivities ?? []);
    } catch (err) {
      console.error("❌ Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    setVisibleActivities(5);
    setShowMoreLoading(false);
  }, [recentActivities]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 text-lg font-semibold">
        Loading dashboard...
      </div>
    );
  }

  const processedData =
    userDistribution.length > 0
      ? userDistribution.map((d) => ({
          ...d,
          visualValue: d.value === 0 ? 1 : d.value,
        }))
      : [];

  const handleShowMore = () => {
    setShowMoreLoading(true);
    setTimeout(() => {
      setVisibleActivities((prev) => prev + 5);
      setShowMoreLoading(false);
    }, 650);
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
        >
          <RefreshCcw size={18} /> Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Students", value: stats.totalStudents, icon: <Users className="text-blue-500" />, color: "bg-blue-100" },
          { label: "Total Teachers", value: stats.totalTeachers, icon: <UserCheck className="text-green-500" />, color: "bg-green-100" },
          { label: "Announcements", value: stats.totalAnnouncements, icon: <Megaphone className="text-purple-500" />, color: "bg-purple-100" },
          { label: "Violations", value: stats.totalViolations, icon: <AlertCircle className="text-red-500" />, color: "bg-red-100" },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-xl shadow p-3 flex justify-between items-center hover:scale-[1.02] transition-transform bg-white"
          >
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">{stat.label}</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{stat.value}</h2>
            </div>
            <div className={`${stat.color} rounded-full p-2`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-10">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow p-4 min-h-[320px] flex flex-col items-center justify-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">User Distribution by Department</h2>
          {processedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={processedData}
                  dataKey="visualValue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(props: PieLabelRenderProps) => {
                    const { name, percent } = props as unknown as {
                      name: string;
                      value: number;
                      percent: number;
                    };
                    const realValue = userDistribution.find((d) => d.name === name)?.value ?? 0;
                    return `${name} ${realValue === 0 ? "0%" : `${(percent! * 100).toFixed(0)}%`}`;
                  }}
                  
                >
                  {processedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.value === 0 ? "#D1D5DB" : COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(_v: number, _n, payload) => {
                  const trueVal = (payload?.payload as any)?.value ?? 0;
                  return [`${trueVal} Students`, payload?.name];
                }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 italic mt-8 text-center">No department data available</p>
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 text-blue-700 tracking-tight">Activity Feed</h2>
          <div className="max-h-[320px] overflow-y-auto mb-3 pr-2">
            {recentActivities.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentActivities.slice(0, visibleActivities).map((activity) => (
                  <li key={activity.id} className="py-2 flex justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{activity.type}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-400">{activity.date}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm italic">No activities found.</p>
            )}
          </div>
          {visibleActivities < recentActivities.length && (
            <div className="flex justify-center">
              <button
                onClick={handleShowMore}
                disabled={showMoreLoading}
                className="w-full sm:w-2/3 px-3 py-2 shadow rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-2 justify-center hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {showMoreLoading ? (
                  <span className="flex items-center opacity-90">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3H4z" />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  <>
                    <RefreshCcw size={18} /> Show More
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Students per Department */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Total Students per Department</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userDistribution.map((dept, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg shadow hover:scale-[1.02] transition-transform">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm">{dept.name}</p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{dept.value}</h3>
              </div>
              <div className="p-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length], color: "white" }}>
                <Users size={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
