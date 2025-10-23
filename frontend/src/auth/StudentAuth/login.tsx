import React, { useState } from "react";
import axios from "axios";

interface LoginProps {
  onBack: () => void;
  onSignup: () => void;
  onLoginSuccess: (role: "student") => void;
}

export function Login({ onBack, onSignup, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail.endsWith("@my.nst.edu.ph")) {
      setLoginError("Please use your official NST email (e.g., student@my.nst.edu.ph)");
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/student/login`,
        {
          email: trimmedEmail,
          password,
        }
      );

      if (data.token) {
        localStorage.setItem("studentToken", data.token);
        onLoginSuccess("student");
      } else {
        setLoginError(data.message || "Invalid login credentials");
      }
    } catch (error: any) {
      setLoginError(error.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 px-4">
      {/* Background shapes */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-blue-200 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-300 rounded-full blur-3xl opacity-30 animate-pulse" />

      <div className="relative w-full max-w-md z-10 bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 flex items-center gap-1 text-gray-600 hover:text-indigo-700 transition select-none"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-8 pt-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700">Nova Schola Tanauan</h1>
          <p className="text-xs sm:text-sm text-gray-500">Student Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="student@my.nst.edu.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-indigo-600 mt-1 select-none"
            >
              {showPassword ? "Hide" : "Show"} Password
            </button>
          </div>

          {loginError && <p className="text-red-600 text-sm">{loginError}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-2 rounded-md font-semibold shadow-md hover:shadow-lg transition duration-300 disabled:opacity-60 text-sm"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-4 text-xs sm:text-sm">
          <span className="text-gray-500">Don’t have an account? </span>
          <button
            type="button"
            onClick={onSignup}
            className="text-indigo-600 hover:underline font-medium"
          >
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
}
