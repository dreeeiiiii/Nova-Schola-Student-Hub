"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type PieLabelRenderProps,
} from "recharts";
import {
  Activity,
  Users,
  ShieldAlert,
  Megaphone,
  RefreshCw,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface ReportStats {
  totalStudents: number;
  totalTeachers: number;
  totalViolations: number;
  totalAnnouncements: number;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

function useResponsiveValue<T>(mobile: T, desktop: T) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return isMobile ? mobile : desktop;
}

const AdminReportAnalyticsPage: React.FC = () => {
  const [filter, setFilter] = useState("This Month");
  const [stats, setStats] = useState<ReportStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalViolations: 0,
    totalAnnouncements: 0,
  });

  const [violationsTrend, setViolationsTrend] = useState<
    { name: string; count: number }[]
  >([]);
  const [activityTrend, setActivityTrend] = useState<
    { name: string; count: number }[]
  >([]);
  const [userDistribution, setUserDistribution] = useState<
    { name: string; value: number }[]
  >([]);

  const BASE_URL = `${import.meta.env.VITE_API_URL}/admin/reports/analytics`;
  const adminToken = typeof window !== "undefined"
    ? localStorage.getItem("adminToken")
    : null;

  // Graph resizing for mobile vs desktop
  const pieOuterRadius = useResponsiveValue(54, 90);
  const barChartSize = useResponsiveValue(15, 40);
  const chartFontSize = useResponsiveValue("12px", "14px");
  const chartPadding = useResponsiveValue("pt-1 pb-1 px-0", "pt-4 pb-2 px-0");

  /* FETCH ANALYTICS DATA */
  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = res.data.data;

      setStats({
        totalStudents: data.totalStudents,
        totalTeachers: data.totalTeachers,
        totalViolations: data.totalViolations,
        totalAnnouncements: data.totalAnnouncements,
      });

      setViolationsTrend(
        data.violationsTrend.map((v: any) => ({
          name: v.day,
          count: v.count,
        }))
      );

      setActivityTrend(
        data.activityTrend.map((a: any) => ({
          name: a.day,
          count: a.count,
        }))
      );

      setUserDistribution([
        { name: "Students", value: data.totalStudents },
        { name: "Teachers", value: data.totalTeachers },
      ]);
    } catch (err) {
      console.error("❌ Error fetching analytics:", err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line
  }, []);

  const handleRefresh = () => fetchAnalytics();

  /* COMPONENT RENDERING */
  return (
    <div className="pt-24 pb-8 px-2 sm:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 min-h-screen transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Activity className="text-blue-600" />
          Report Analytics
        </h1>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 flex-1"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {[
          {
            label: "Students",
            value: stats.totalStudents,
            icon: <Users className="text-blue-500" />,
            color: "from-blue-100 to-blue-50",
          },
          {
            label: "Teachers",
            value: stats.totalTeachers,
            icon: <Users className="text-green-500" />,
            color: "from-green-100 to-green-50",
          },
          {
            label: "Violations",
            value: stats.totalViolations,
            icon: <ShieldAlert className="text-red-500" />,
            color: "from-red-100 to-red-50",
          },
          {
            label: "Announcements",
            value: stats.totalAnnouncements,
            icon: <Megaphone className="text-yellow-500" />,
            color: "from-yellow-100 to-yellow-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${stat.color} rounded-2xl shadow-md p-4 sm:p-5 flex justify-between items-center hover:scale-[1.03] transition-transform`}
          >
            <div>
              <p className="text-gray-600 text-xs sm:text-sm">{stat.label}</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                {stat.value.toLocaleString()}
              </h2>
            </div>
            <div className="bg-white rounded-full p-[10px] sm:p-3 shadow-inner">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Violations Trend */}
        <div className={`bg-white rounded-2xl shadow-md border border-gray-100 ${chartPadding} min-h-[240px]`}>
          <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700">
            <TrendingUp className="text-blue-500" /> Violations Trend
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={violationsTrend}>
              <XAxis dataKey="name" tick={{ fontSize: chartFontSize }} />
              <YAxis tick={{ fontSize: chartFontSize }} />
              <Tooltip labelStyle={{ fontSize: chartFontSize }} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={useResponsiveValue(2, 3)}
                dot={{ r: useResponsiveValue(2.2, 4) }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution */}
        <div className={`bg-white rounded-2xl shadow-md border border-gray-100 ${chartPadding} min-h-[240px]`}>
          <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700">
            <Users className="text-green-500" /> User Distribution
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={userDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={pieOuterRadius}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }: PieLabelRenderProps) =>
                  `${name} ${((percent! as number) * 100).toFixed(0)}%`
                }
              >
                {userDistribution.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 pt-3 pb-2 sm:pt-6 sm:pb-3 px-0 min-h-[260px]">
          <h2 className="text-base sm:text-lg font-semibold mb-3 flex items-center gap-2 text-gray-700">
            <Calendar className="text-purple-500" /> Weekly Activity Overview
          </h2>
          <ResponsiveContainer width="100%" height={useResponsiveValue(180, 260)}>
            <BarChart data={activityTrend}>
              <XAxis dataKey="name" tick={{ fontSize: chartFontSize }} />
              <YAxis tick={{ fontSize: chartFontSize }} />
              <Tooltip labelStyle={{ fontSize: chartFontSize }} />
              <Bar dataKey="count" fill="#8B5CF6" barSize={barChartSize} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminReportAnalyticsPage;
