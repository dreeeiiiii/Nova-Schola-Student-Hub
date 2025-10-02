import React, { useState } from "react";

interface SignupProps {
  onSignup: () => void;
  onBack: () => void;
  onLogin: () => void;
}

export function Signup({ onSignup, onBack, onLogin }: SignupProps) {
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
  const [isLoading, setIsLoading] = useState(false);

  const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const departments = [
    "Bachelor of Science in Information System",
    "Bachelor of Science in Accounting Information Systems",
    "Bachelor of Science in Criminology",
    "Bachelor of Science in Entrepreneurship",
    "Bachelor of Technical-Vocational Teacher Education",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    if (!agreeToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignup();
    }, 2000);
  };

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(formData.password), text: "One uppercase letter" },
    { met: /[a-z]/.test(formData.password), text: "One lowercase letter" },
    { met: /\d/.test(formData.password), text: "One number" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl relative">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 lg:top-8 lg:left-8 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          {/* ArrowLeft SVG */}
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
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              {/* GraduationCap SVG */}
              <svg
                className="h-7 w-7 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M22 12l-10 7-10-7 10-7 10 7z" />
                <path d="M2 17l10 7 10-7" />
                <path d="M12 22v-15" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Nova Schola Tanauan</h1>
              <p className="text-sm text-muted-foreground">Student Registration</p>
            </div>
          </div>
        </div>

        {/* Signup Card */}
        <div className="border-2 rounded-lg bg-white p-6 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl text-primary font-semibold mb-1">Join the NST Community</h2>
            <p className="text-muted-foreground">
              Create your student account and start your journey with Nova Schola Tanauan
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["firstName", "lastName"].map((field) => (
                <div className="space-y-2" key={field}>
                  <label className="block text-sm font-medium text-gray-700" htmlFor={field}>
                    {field === "firstName" ? "First Name" : "Last Name"}
                  </label>
                  <input
                    id={field}
                    type="text"
                    placeholder={field === "firstName" ? "John" : "Doe"}
                    value={formData[field as keyof typeof formData]}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              ))}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="john.doe@nst.edu.ph"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Student ID and Year Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="studentId">
                  Student ID
                </label>
                <input
                  id="studentId"
                  type="text"
                  placeholder="NS202400123"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange("studentId", e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700" htmlFor="yearLevel">
                  Year Level
                </label>
                <select
                  id="yearLevel"
                  value={formData.yearLevel}
                  onChange={(e) => handleInputChange("yearLevel", e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="" disabled>
                    Select year level
                  </option>
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
              <label className="block text-sm font-medium text-gray-700" htmlFor="department">
                Department/Major
              </label>
              <select
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange("department", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="" disabled>
                  Select your department
                </option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="space-y-2 relative">
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    {/* EyeOff icon */}
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3-11-7a10.96 10.96 0 0 1 5.14-5.83" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    {/* Eye icon */}
                    <circle cx="12" cy="12" r="3" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.476 0 8.268 2.943 9.542 7-1.274 4.057-5.066 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              {/* Password requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1 text-xs">
                  {passwordRequirements.map((req, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 ${
                        req.met ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      <svg
                        className={`h-3 w-3 flex-shrink-0 ${
                          req.met ? "text-green-600" : "text-gray-400"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{req.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 relative">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    {/* EyeOff icon */}
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3-11-7a10.96 10.96 0 0 1 5.14-5.83" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    {/* Eye icon */}
                    <circle cx="12" cy="12" r="3" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.476 0 8.268 2.943 9.542 7-1.274 4.057-5.066 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              {/* Password match indicator */}
              {formData.confirmPassword && (
                <div
                  className={`flex items-center gap-2 text-xs ${
                    formData.password === formData.confirmPassword
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  <svg
                    className="h-3 w-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    {formData.password === formData.confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </span>
                </div>
              )}
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
                <a href="#terms" className="text-primary hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !agreeToTerms}
              className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md font-semibold transition disabled:opacity-50"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Already have account */}
          <div className="relative my-4">
            <hr />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              Already have an account?{" "}
            </span>
            <button
              onClick={onLogin}
              className="text-primary hover:underline text-sm p-0"
              type="button"
            >
              Sign in here
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            By creating an account, you agree to our terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}
