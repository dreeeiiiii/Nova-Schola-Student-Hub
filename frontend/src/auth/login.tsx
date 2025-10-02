import React, { useState } from "react";

interface LoginProps {
  onLogin: () => void;
  onBack: () => void;
  onSignup: () => void;
}

export function Login({ onLogin, onBack, onSignup }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md relative">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          {/* ArrowLeft SVG */}
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>

        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8 pt-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              {/* GraduationCap SVG */}
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 12l-10 7-10-7 10-7 10 7z" />
                <path d="M2 17l10 7 10-7" />
                <path d="M12 22v-15" />
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-primary">Nova Schola Tanauan</h1>
              <p className="text-sm text-muted-foreground">Student Portal</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="border-2 rounded-lg bg-white p-6 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl text-primary font-semibold mb-1">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to access your student portal and stay connected.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="student@nst.edu.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    {/* EyeOff icon */}
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3-11-7a10.96 10.96 0 0 1 5.14-5.83" />
                    <path d="M1 1l22 22" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    {/* Eye icon */}
                    <circle cx="12" cy="12" r="3" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.476 0 8.268 2.943 9.542 7-1.274 4.057-5.066 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button type="button" className="text-sm text-primary hover:underline p-0">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md font-semibold transition disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-4">
            <hr />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
              or continue with
            </span>
          </div>

          {/* Demo Account */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full border border-primary text-primary py-2 rounded-md font-semibold hover:bg-primary hover:text-white transition"
              onClick={() => {
                setEmail("student@nst.edu.ph");
                setPassword("demo123");
              }}
            >
              Use Demo Account
            </button>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <button
                type="button"
                onClick={onSignup}
                className="text-primary hover:underline text-sm p-0"
              >
                Sign up here
              </button>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <a href="#terms" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
}
