"use client";

import React, { useState, type JSX } from "react";
import { User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface TeacherLoginProps {
  onLoginSuccess?: () => void; // ✅ added for navbar refresh
}

export default function TeacherLogin({ onLoginSuccess }: TeacherLoginProps): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/teacher/login`,
        { email, password }
      );

      if (response.data.success && response.data.token) {
        localStorage.setItem("teacherToken", response.data.token);

        // ✅ Trigger navbar update in App.tsx
        onLoginSuccess?.();

        // ✅ Redirect after login
        navigate("/teacher/announcements");
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Server error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-6">
      <div className="bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-w-4xl w-full">
        {/* Left side: illustration / welcome */}
        <div className="hidden md:flex flex-1 bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 items-center justify-center relative">
          <h1 className="text-white text-4xl font-bold p-6 text-center">
            Welcome Back, Teacher! 🎓
          </h1>
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-center text-sm opacity-70">
            Keep the student vibes going!
          </div>
        </div>

        {/* Right side: login form */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center md:text-left">
            Teachers Login
          </h2>

          {error && (
            <div className="mb-4 text-red-500 text-sm text-center md:text-left">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                required
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 accent-indigo-500"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-indigo-500 text-sm hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 font-semibold rounded-xl transition ${
                isLoading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Optional bottom message */}
          <p className="mt-6 text-center text-gray-500 text-sm">
            Not an admin?{" "}
            <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">
              Contact Support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
