"use client";

import "./App.css";
import "./index.css";
import Navbar from "./components/navbar";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";

// Auth Pages
import { Login } from "./auth/StudentAuth/login";
import { Signup } from "./auth/StudentAuth/register";
import TeacherLogin from "./auth/TeacherAuth/login";
import { AdminLogin } from "./auth/Admin/login";

// Dashboards
import { StudentDashboardLayout } from "./layout/studentDashboard";
import { TeacherDashboardLayout } from "./layout/teacherDashboard";
import { AdminDashboardLayout } from "./layout/adminDashboard";

// Student Pages
import Announcements from "./pages/StudentDashboard/announcement";
import ContactsUI from "./pages/StudentDashboard/contact";
import { SettingsPage } from "./pages/StudentDashboard/settings";
import ProfilePage from "./pages/StudentDashboard/profile";

// Teacher Pages
import { TeacherAnnouncements } from "./pages/TeacherDashboard/announcement";
import { TeacherMessages } from "./pages/TeacherDashboard/message";
import { TeacherProfile } from "./pages/TeacherDashboard/profile";
import { TeacherSettings } from "./pages/TeacherDashboard/settings";

// Admin Pages

import AdminTeachersPage from "./pages/AdminDashboard/teachers";
import AdminStudentsPage from "./pages/AdminDashboard/students";
import AdminViolationsPage from "./pages/AdminDashboard/violations";
import AdminAnnouncementPage from "./pages/AdminDashboard/announcement";

// Route Protection
import { TeacherProtectedRoute } from "./routes/TeacherProtectedRoutes";
import { StudentProtectedRoute } from "./routes/StudentProtectedRoute";
import { AdminProtectedRoute } from "./routes/AdminProtectedRoute";

// Homepage
import { Home } from "./pages/Homepage/homepage";
import AdminReportAnalyticsPage from "./pages/AdminDashboard/report-and-analytics";
import SystemMaintenancePage from "./pages/AdminDashboard/system-maintenance";
import AdminSettingsPage from "./pages/AdminDashboard/settings";
import AdminDashboard from "./pages/AdminDashboard/dashboard";
import {MessagesPage} from "./pages/StudentDashboard/message";
import  Connect  from "./pages/TeacherDashboard/connect";



type UserRole = "student" | "teacher" | "admin" | null;

const App = () => {
  const navigate = useNavigate();

  // Determine role based on token presence
  const [role, setRole] = useState<UserRole>(() => {
    if (localStorage.getItem("studentToken")) return "student";
    if (localStorage.getItem("teacherToken")) return "teacher";
    if (localStorage.getItem("adminToken")) return "admin";
    return null;
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    navigate("/", { replace: true }); // navigate first
    localStorage.removeItem("studentToken");
    localStorage.removeItem("teacherToken");
    localStorage.removeItem("adminToken");
    setRole(null);
  };
  

  const handleLoginRedirect = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === "student") navigate("/student");
    else if (newRole === "teacher") navigate("/teacher");
    else if (newRole === "admin") navigate("/admin");
  };

  const redirectPath = role === "student"
    ? "/student"
    : role === "teacher"
      ? "/teacher"
      : role === "admin"
        ? "/admin"
        : "/login";

  return (
    <>
      {/* Navbar */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/50 border-b border-white/20 shadow-md">
        <Navbar role={role} onLogoutClick={() => setShowLogoutModal(true)} />
      </div>

      {/* Main Content */}
      <div className="relative min-h-screen flex flex-col text-gray-800 font-inter overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[3px]"></div>

        <main className="relative z-10 flex-1">
          <Routes>
            {/* Home */}
            <Route
              path="/"
              element={role ? <Navigate to={redirectPath} replace /> : <Home />}
            />

            {/* Auth */}
            <Route
              path="/login"
              element={role ? <Navigate to={redirectPath} replace /> : <Login onLoginSuccess={handleLoginRedirect} onBack={() => navigate("/")} onSignup={() => navigate("/register")} />}
            />
            <Route
              path="/register"
              element={role ? <Navigate to={redirectPath} replace /> : <Signup onLogin={() => handleLoginRedirect("student")} onBack={() => navigate("/")} />}
            />

            {/* Teacher Login */}
            <Route
              path="/teachers"
              element={role ? <Navigate to={redirectPath} replace /> : <TeacherLogin onLoginSuccess={() => handleLoginRedirect("teacher")} />}
            />

            {/* Admin Login */}
            <Route
              path="/admins"
              element={role ? <Navigate to={redirectPath} replace /> : <AdminLogin onLoginSuccess={() => handleLoginRedirect("admin")} />}
            />

            {/* Student Dashboard */}
            <Route path="/student" element={<StudentProtectedRoute><StudentDashboardLayout /></StudentProtectedRoute>}>
              <Route index element={<Announcements />} />
              <Route path="announcement" element={<Announcements />} />
              <Route path="contacts" element={<ContactsUI />} />
              <Route path="message" 
                  element={<MessagesPage />}>
              </Route>
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Teacher Dashboard */}
            <Route path="/teacher" element={<TeacherProtectedRoute><TeacherDashboardLayout /></TeacherProtectedRoute>}>
              <Route index element={<TeacherAnnouncements />} />
              <Route path="announcements" element={<TeacherAnnouncements />} />
              <Route path="messages" element={<TeacherMessages />} />
              <Route path="connect" element={<Connect />} />
              <Route path="profile" element={<TeacherProfile />} />
              <Route path="settings" element={<TeacherSettings />} />
            </Route>

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminProtectedRoute><AdminDashboardLayout /></AdminProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="announcements" element={<AdminAnnouncementPage />} />
              <Route path="teachers" element={<AdminTeachersPage/>} />
              <Route path="students" element={<AdminStudentsPage />} />
              <Route path="violations" element={<AdminViolationsPage />} />
              <Route path="reports-and-analytics" element={<AdminReportAnalyticsPage />} />
              <Route path="system-maintenance" element={<SystemMaintenancePage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            
            </Route>
          </Routes>
        </main>

        {/* Logout Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-96 shadow-lg flex flex-col items-center relative">
              <h2 className="text-xl font-semibold mb-4">Confirm Logout</h2>
              <p className="mb-6 text-center">Are you sure you want to logout?</p>
              <div className="flex gap-4">
                <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                <button onClick={() => {
                  setIsLoggingOut(true);
                  setShowLogoutModal(false);
                  setTimeout(() => { setIsLoggingOut(false); handleLogout(); }, 1000);
                }} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">Logout</button>
              </div>
            </div>
          </div>
        )}

        {/* Logging out spinner */}
        {isLoggingOut && (
          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-[99999]">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </>
  );
};

export default App;
