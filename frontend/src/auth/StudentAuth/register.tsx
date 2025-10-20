import React, { useState } from "react";
import axios from "axios";

interface SignupProps {
  onBack: () => void;
  onLogin: () => void; // called after successful signup
}

export function Signup({ onBack, onLogin }: SignupProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    yearLevel: "",
    department: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

  // ✅ Short codes align with backend course mapping
  const departments = [
    { label: "Bachelor of Science in Information System", value: "BSIS" },
    { label: "Bachelor of Science in Accounting Information Systems", value: "BSAIS" },
    { label: "Bachelor of Science in Criminology", value: "BSCRIM" },
    { label: "Bachelor of Science in Entrepreneurship", value: "BSENTREP" },
    { label: "Bachelor of Technical‑Vocational Teacher Education", value: "BTVED" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match");
      setShowErrorPopup(true);
      return;
    }

    if (!agreeToTerms) {
      setLocalError("Please agree to the terms and conditions");
      setShowErrorPopup(true);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/student/register",
        formData
      );

      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }

        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          onLogin();
        }, 1500);
      } else {
        const backendError = response.data.message || response.data.error;
        setLocalError(
          backendError?.includes("duplicate key")
            ? "This Student ID or Email is already registered."
            : backendError || "Signup failed. Please try again."
        );
        setShowErrorPopup(true);
      }
    } catch (err: any) {
      const backendError =
        err.response?.data?.message || err.response?.data?.error;
      setLocalError(
        backendError?.includes("duplicate key")
          ? "This Student ID or Email is already registered."
          : backendError || "Signup failed. Please try again later."
      );
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 p-6">
      {/* Background blobs */}
      <div className="absolute top-[-100px] left-[-80px] w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute top-[300px] right-[-100px] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-120px] left-[200px] w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Popups */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 text-center animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Registration Successful!
            </h3>
            <p className="text-gray-600 mb-4">Redirecting to login...</p>
          </div>
        </div>
      )}

      {showErrorPopup && localError && (
        <div className="fixed inset-0 z-50 flex items-start justify-center mt-20 pointer-events-none">
          <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in pointer-events-auto">
            {localError}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="relative w-full max-w-2xl z-10">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-gray-600 hover:text-indigo-700 flex items-center gap-2 transition"
        >
          Back
        </button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-700">
            Nova Schola Tanauan
          </h1>
          <p className="text-sm text-gray-500">Student Registration</p>
        </div>

        <div className="backdrop-blur-xl bg-white/70 border border-white/50 shadow-lg rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["firstName", "lastName"].map((field) => (
                <div className="space-y-2" key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field === "firstName" ? "First Name" : "Last Name"}
                  </label>
                  <input
                    type="text"
                    placeholder={field === "firstName" ? "John" : "Doe"}
                    value={formData[field as keyof typeof formData]}
                    onChange={(e) =>
                      handleInputChange(field, e.target.value)
                    }
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              ))}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="john.doe@my.nst.edu.ph"
                value={formData.email}
                onChange={(e) =>
                  handleInputChange("email", e.target.value)
                }
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Student ID & Year Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <input
                  type="text"
                  placeholder="NS202400123"
                  value={formData.studentId}
                  onChange={(e) =>
                    handleInputChange("studentId", e.target.value)
                  }
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Year Level
                </label>
                <select
                  value={formData.yearLevel}
                  onChange={(e) =>
                    handleInputChange("yearLevel", e.target.value)
                  }
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">Select year level</option>
                  {yearLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Department / Major
              </label>
              <select
                value={formData.department}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Select your department</option>
                {departments.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { field: "password", show: showPassword, set: setShowPassword },
                {
                  field: "confirmPassword",
                  show: showConfirmPassword,
                  set: setShowConfirmPassword,
                },
              ].map(({ field, show, set }) => (
                <div className="space-y-2 relative" key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field === "password" ? "Password" : "Confirm Password"}
                  </label>
                  <input
                    type={show ? "text" : "password"}
                    placeholder={
                      field === "password"
                        ? "Create a strong password"
                        : "Confirm password"
                    }
                    value={formData[field as keyof typeof formData]}
                    onChange={(e) =>
                      handleInputChange(field, e.target.value)
                    }
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={() => set(!show)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-indigo-600"
                  >
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
              ))}
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="terms"
                className="text-sm leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <a
                  href="#terms"
                  className="text-indigo-600 hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#privacy"
                  className="text-indigo-600 hover:underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !agreeToTerms}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-semibold transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
