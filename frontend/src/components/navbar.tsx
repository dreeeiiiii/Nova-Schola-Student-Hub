"use client";

import React from "react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  role?: "student" | "teacher" | "admin" | null;
  onLogoutClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ role, onLogoutClick }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!role;

  const handleLogoClick = () => {
    if (role === "student") navigate("/student/announcement");
    else if (role === "teacher") navigate("/teacher/announcements");
    else if (role === "admin") navigate("/admin/dashboard");
    else navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-3 py-2 bg-white border-b border-gray-200 shadow-md">
      {/* Logo */}
      <div onClick={handleLogoClick} className="flex items-center gap-1 cursor-pointer select-none">
        <img src="/nst.png" alt="NST Logo" className="h-6 w-6 rounded-full object-cover" />
        <h1 className="text-sm font-semibold text-blue-900">Nova Schola Hub</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 text-sm">
        {isLoggedIn ? (
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md font-semibold transition"
            onClick={onLogoutClick}
            type="button"
          >
            Logout
          </button>
        ) : (
          <>
            <button
              className="text-gray-700 hover:text-gray-900 font-medium transition"
              onClick={() => navigate("/login")}
              type="button"
            >
              Login
            </button>
            <button
              className="bg-blue-900/10 hover:bg-blue-900/30 text-blue-900 px-3 py-1 rounded-md font-semibold transition"
              onClick={() => navigate("/register")}
              type="button"
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
